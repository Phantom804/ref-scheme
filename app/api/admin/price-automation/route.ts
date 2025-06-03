import { connectToDatabase } from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import PriceAutomation from '@/lib/models/PriceAutomation';
import PriceHistory from '@/lib/models/PriceHistory';
import { Product } from '@/lib/models/Product';
import cron from 'node-cron';

// Store active cron jobs with their IDs
const activeCronJobs = new Map();

// Function to create a price history entry
async function createPriceHistoryEntry(productId: string, price: number, date: Date) {
    try {
        // Round price to 2 decimal places
        const roundedPrice = parseFloat(price.toFixed(2));

        const entry = await PriceHistory.create({
            productId,
            price: roundedPrice,
            date
        });

        // Update product's price with the latest price
        await Product.findByIdAndUpdate(productId, { price: roundedPrice });

        return entry;
    } catch (error) {
        console.error('Error creating price history entry:', error);
        throw error;
    }
}

// Function to schedule price changes
function schedulePriceChanges(automation: any) {
    // Cancel existing job if it exists
    if (activeCronJobs.has(automation._id.toString())) {
        const existingJob = activeCronJobs.get(automation._id.toString());
        existingJob.stop();
        activeCronJobs.delete(automation._id.toString());
    }

    const startDate = new Date(automation.startDate);
    const endDate = new Date(automation.endDate);
    const now = new Date();

    // If the end date has passed, mark as inactive and return
    if (endDate < now) {
        PriceAutomation.findByIdAndUpdate(automation._id, { isActive: false }).catch(console.error);
        return;
    }

    // If start date is in the future, schedule a one-time job to start the automation
    if (startDate > now) {
        const startDelay = startDate.getTime() - now.getTime();
        setTimeout(() => {
            startPriceAutomation(automation);
        }, startDelay);
        return;
    }

    // If we're between start and end dates, start the automation immediately
    if (startDate <= now && now <= endDate) {
        startPriceAutomation(automation);
    }
}

// Function to start price automation
async function startPriceAutomation(automation: any) {
    const startDate = new Date(automation.startDate);
    const endDate = new Date(automation.endDate);
    const startPrice = automation.startPrice;
    const targetPercentage = automation.targetPercentage;
    const productId = automation.productId;

    // Calculate total duration in minutes
    const totalDurationMs = endDate.getTime() - startDate.getTime();
    const totalMinutes = Math.floor(totalDurationMs / 60000);

    // Calculate price change per minute
    const totalPriceChange = startPrice * (targetPercentage / 100);
    const priceChangePerMinute = totalPriceChange / totalMinutes;

    // Get current time
    const now = new Date();

    // Calculate how many minutes have passed since start
    const elapsedMs = now.getTime() - startDate.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    // Calculate current price based on elapsed time
    let currentPrice = startPrice;
    if (elapsedMinutes > 0) {
        currentPrice = startPrice + (priceChangePerMinute * elapsedMinutes);
    }

    // Schedule a job to run every minute
    const job = cron.schedule('* * * * *', async () => {
        const currentTime = new Date();

        // If we've passed the end date, stop the job
        if (currentTime >= endDate) {
            // Create final price history entry
            const finalPrice = parseFloat((startPrice * (1 + targetPercentage / 100)).toFixed(2));
            await createPriceHistoryEntry(productId.toString(), finalPrice, endDate);

            // Update automation status
            await PriceAutomation.findByIdAndUpdate(automation._id, { isActive: false });

            // Stop the job
            job.stop();
            activeCronJobs.delete(automation._id.toString());
            return;
        }

        // Calculate minutes elapsed since start
        const minutesElapsed = Math.floor((currentTime.getTime() - startDate.getTime()) / 60000);

        // Calculate new price
        const newPrice = parseFloat((startPrice + (priceChangePerMinute * minutesElapsed)).toFixed(2));

        // Create price history entry
        await createPriceHistoryEntry(productId.toString(), newPrice, currentTime);
    });

    // Store the job reference
    activeCronJobs.set(automation._id.toString(), job);
}

// Initialize active automations when the server starts
async function initializeAutomations() {
    try {
        await connectToDatabase();
        const activeAutomations = await PriceAutomation.find({ isActive: true });

        activeAutomations.forEach(automation => {
            schedulePriceChanges(automation);
        });

        console.log(`Initialized ${activeAutomations.length} active price automations`);
    } catch (error) {
        console.error('Error initializing price automations:', error);
    }
}

// Initialize automations when the server starts
initializeAutomations();

// Create a new price automation
export async function POST(req: NextRequest) {
    await connectToDatabase();
    const data = await req.json();

    const { productId, startDate, endDate, startTime, endTime, percentage } = data;

    if (!productId || !startDate || !endDate || !startTime || !endTime || percentage === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Get the current product price
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Create start and end date objects with time
        const startDateTime = new Date(startDate);
        const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, startSeconds || 0);

        const endDateTime = new Date(endDate);
        const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, endSeconds || 0);

        // Validate dates
        if (endDateTime <= startDateTime) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Create automation record
        const automation = await PriceAutomation.create({
            productId,
            startDate: startDateTime,
            endDate: endDateTime,
            startPrice: product.price,
            targetPercentage: parseFloat(percentage),
            isActive: true
        });

        // Schedule the price changes
        schedulePriceChanges(automation);

        return NextResponse.json(automation);
    } catch (error) {
        console.error('Error creating price automation:', error);
        return NextResponse.json({ error: 'Failed to create price automation' }, { status: 500 });
    }
}

// Get active automations for a product
export async function GET(req: NextRequest) {
    await connectToDatabase();
    const productId = req.nextUrl.searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
        const automations = await PriceAutomation.find({
            productId,
            isActive: true
        }).sort({ createdAt: -1 });

        return NextResponse.json(automations);
    } catch (error) {
        console.error('Error fetching price automations:', error);
        return NextResponse.json({ error: 'Failed to fetch price automations' }, { status: 500 });
    }
}

// Cancel an automation
export async function DELETE(req: NextRequest) {
    await connectToDatabase();
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Automation ID is required' }, { status: 400 });
    }

    try {
        // Find and update the automation
        const automation = await PriceAutomation.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!automation) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
        }

        // Cancel the cron job if it exists
        if (activeCronJobs.has(id)) {
            const job = activeCronJobs.get(id);
            job.stop();
            activeCronJobs.delete(id);
        }

        return NextResponse.json({ success: true, automation });
    } catch (error) {
        console.error('Error cancelling price automation:', error);
        return NextResponse.json({ error: 'Failed to cancel price automation' }, { status: 500 });
    }
}