# Order Creation with Receipt Upload

This document provides instructions for setting up and using the order creation functionality with receipt image upload in the Digital Marketplace application.

## Features Implemented

- Drag and drop file upload for receipts in the purchase confirmation dialog
- File validation for size (max 1MB) and format (JPEG, PNG only)
- Image preview after upload
- Cloudinary integration for image storage
- MongoDB order creation
- Transaction ID generation and display in success dialog

## Setup Requirements

### Environment Variables

Ensure the following environment variables are set in your `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Dependencies

Make sure to install the required dependencies:

```bash
npm install react-dropzone cloudinary mongoose
```

## How It Works

1. **User Flow**:
   - User selects a product and quantity
   - User enters optional referral code
   - User clicks "Buy Now"
   - Confirmation dialog appears where user uploads receipt image
   - After successful upload and confirmation, order is created
   - Success dialog shows transaction details

2. **Technical Flow**:
   - Frontend uses react-dropzone for file upload handling
   - File validation occurs on both frontend and backend
   - API route uploads image to Cloudinary
   - Order is created in MongoDB with receipt URL
   - Transaction ID is generated and returned to frontend

## API Endpoints

### POST /api/orders

Creates a new order with receipt image upload.

**Request Body (FormData)**:
- `receipt`: File - The receipt image file
- `productId`: String - The ID of the product
- `productName`: String - The name of the product
- `quantity`: Number - The quantity of the product
- `price`: Number - The price of the product
- `referralCode`: String - Optional referral code

**Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "orderId": "order_id_here",
  "transactionId": "ID123456"
}
```

## Components Modified

1. **PurchaseConfirmationDialog**: Added file upload functionality with drag-and-drop support
2. **PaymentCard**: Updated to handle order creation and file upload
3. **PurchaseSuccessDialog**: Updated to display transaction ID from API response

## Database Model

The Order model includes the following fields:
- `productId`: ObjectId reference to Product
- `productName`: String
- `transactionId`: String
- `quantity`: Number
- `referralCode`: String
- `price`: Number
- `status`: String (Pending, Completed, Cancelled)
- `receiptUrl`: String (Cloudinary URL)
- `createdAt` and `updatedAt`: Timestamps