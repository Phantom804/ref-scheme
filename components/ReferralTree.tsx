'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { Button } from "@/components/ui/button";




// Types for our tree data
type ReferralUser = {
    id: string;
    name?: string;
    phoneNumber: string;
    referralCode: string;
};

type TreeNode = {
    name: string;
    attributes?: Record<string, string>;
    children: TreeNode[];
    data?: ReferralUser;
    __loaded?: boolean;
};



const ReferralTree: React.FC = ({ }) => {

    // State to store the tree data
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    // State to track dimensions of the container
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    // State to track loading state
    const [Loading, setLoading] = useState(false);

    const { user, isLoading, isAuthenticated } = useAuth();
    // Ref for the container element
    const containerRef = useRef<HTMLDivElement>(null);


    // Map to track loaded nodes to prevent refetching
    const [loadedNodes, setLoadedNodes] = useState<Record<string, boolean>>({});
    console.log(user)
    const rootUser = user;
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error('Please sign in to view your referral tree');
            // You can add redirection logic here if needed
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <h1 className="text-2xl font-bold">Please sign in to view your referral tree</h1>
                <Button asChild>
                    <a href="/signin">Sign In</a>
                </Button>
            </div>
        );
    }


    // Function to convert a user to a tree node
    const userToTreeNode = (user: ReferralUser, hasChildren = false): TreeNode => ({
        name: user.name || user.phoneNumber,
        attributes: {
            'Referral Code': user.referralCode,
            'Phone': user.phoneNumber,
        },
        children: [],
        data: user,
        __loaded: !hasChildren, // Mark as loaded if it has no children
    });

    // Initialize the tree with the root user
    useEffect(() => {
        if (rootUser) {
            // Create the root node
            const rootNode = userToTreeNode(rootUser, true);
            setTreeData(rootNode);

            // Fetch the root user's direct referrals
            fetchReferrals(rootUser.referralCode, rootNode);
        }
    }, [rootUser]);

    // Force a re-render after component mounts to ensure proper centering
    const [forceRender, setForceRender] = useState(0);
    useEffect(() => {
        // Small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            setForceRender(prev => prev + 1);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    // Update dimensions when the component mounts or window resizes
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        // Initial update
        updateDimensions();

        // Set a small timeout to ensure the container has fully rendered
        const timeoutId = setTimeout(updateDimensions, 100);

        // Add resize listener
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timeoutId);
        };
    }, []);

    // Function to fetch referrals for a given referral code
    const fetchReferrals = useCallback(async (referralCode: string, parentNode: TreeNode) => {
        // Check if this node is already loaded
        if (loadedNodes[referralCode]) {
            return;
        }

        setLoading(true);
        const toastID = toast.loading(`Loading referrals for ${parentNode.name}...`);

        try {
            const response = await fetch(`/api/referrals?referralCode=${referralCode}`);
            const data = await response.json();

            if (data.success) {
                // Mark this node as loaded
                setLoadedNodes(prev => ({ ...prev, [referralCode]: true }));

                // Update the tree data with the new children
                setTreeData(prevData => {
                    if (!prevData) return null;

                    // Create a deep copy of the tree data
                    const newData = JSON.parse(JSON.stringify(prevData));

                    // Find the parent node in the tree
                    const findAndUpdateNode = (node: TreeNode): boolean => {
                        if (node.data?.referralCode === referralCode) {
                            // Add children to this node
                            node.children = data.users.map((user: ReferralUser) =>
                                userToTreeNode(user, true)
                            );
                            node.__loaded = true;
                            return true;
                        }

                        // Recursively search for the parent node
                        for (let i = 0; i < node.children.length; i++) {
                            if (findAndUpdateNode(node.children[i])) {
                                return true;
                            }
                        }

                        return false;
                    };

                    findAndUpdateNode(newData);
                    return newData;
                });


                toast.dismiss(toastID)
            } else {
                toast.error('Failed to load referrals');
            }
        } catch (error) {
            console.error('Error fetching referrals:', error);
            toast.error('Error loading referrals');
        } finally {
            setLoading(false);
        }
    }, [loadedNodes]);

    // Custom node renderer
    const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
        const node = nodeDatum as TreeNode;
        const isLoaded = node.__loaded;

        return (
            <g>
                {/* User icon circle */}
                <circle
                    r={25}
                    fill="#0A0A0F"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    onClick={() => {
                        if (!isLoaded && node.data) {
                            fetchReferrals(node.data.referralCode, node);
                        }
                        toggleNode();
                    }}
                    cursor="pointer"
                />
                {/* User icon */}
                <foreignObject x="-12" y="-12" width="24" height="24">
                    <User color="#8B5CF6" size={24} />
                </foreignObject>
                {/* Name label with white background */}
                <rect
                    x="-50"
                    y="35"
                    width="100"
                    height="30"
                    rx="15"
                    ry="15"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth={1}
                />
                <text
                    x="0"
                    y="53"
                    textAnchor="middle"
                    style={{ fill: '#1F2937', fontSize: '14px', fontFamily: 'inter', letterSpacing: 3, textDecoration: 'none' }}
                >
                    {node.name}
                </text>
            </g>
        );
    };

    if (!treeData) {
        return <div>Loading tree data...</div>;
    }

    return (
        <div className="bg-[#1A1F2C] rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl text-white font-semibold mb-4">Referral Tree</h2>
            <div className="h-[400px] md:h-[600px] w-full border border-purple-600 rounded-lg overflow-hidden">

                <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
                    <Tree
                        data={treeData}
                        translate={{ x: dimensions.width / 2, y: dimensions.height / 3 }}
                        orientation="vertical"
                        nodeSize={{ x: dimensions.width < 768 ? 150 : 200, y: dimensions.width < 768 ? 80 : 100 }}
                        separation={{ siblings: dimensions.width < 768 ? 1.5 : 2, nonSiblings: dimensions.width < 768 ? 2 : 2.5 }}
                        renderCustomNodeElement={renderCustomNode}
                        pathFunc="step"
                        pathClassFunc={() => 'tree-link'}
                        centeringTransitionDuration={800}
                        transitionDuration={800}
                    />

                </div>
            </div>
        </div>
    );
};

export default ReferralTree;