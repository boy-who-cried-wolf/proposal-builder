
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssistantChat } from '@/components/assistant/AssistantChat';

const AssistantPage = () => {
  // Create an empty array for proposalSections to satisfy the component requirements
  const proposalSections = [];

  return (
    <Layout>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-poppins text-gray-800">AI Assistant</h1>
        </div>

        <Card className="border-[#E5DEFF] shadow-md">
          <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
            <CardTitle className="text-[#6E59A5] font-poppins">AI Assistant</CardTitle>
            <CardDescription className="text-[#8E9196] font-poppins">
              Get help with your proposals and business needs using our AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AssistantChat proposalSections={proposalSections} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssistantPage;
