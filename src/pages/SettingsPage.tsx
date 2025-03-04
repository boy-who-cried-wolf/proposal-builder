
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-poppins text-gray-800">Settings</h1>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="bg-[#F1F0FB] mb-6">
            <TabsTrigger value="account" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
              Account
            </TabsTrigger>
            <TabsTrigger value="organization" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
              Organization
            </TabsTrigger>
            <TabsTrigger value="plan" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
              Subscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card className="border-[#E5DEFF] shadow-md">
              <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
                <CardTitle className="text-[#6E59A5] font-poppins">Account Settings</CardTitle>
                <CardDescription className="text-[#8E9196] font-poppins">
                  Manage your personal account information.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <button 
                  className="text-[#9b87f5] hover:underline font-poppins"
                  onClick={() => navigate('/account-settings')}
                >
                  Go to Account Settings
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization">
            <Card className="border-[#E5DEFF] shadow-md">
              <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
                <CardTitle className="text-[#6E59A5] font-poppins">Organization Settings</CardTitle>
                <CardDescription className="text-[#8E9196] font-poppins">
                  Manage your organization information and team members.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <button 
                  className="text-[#9b87f5] hover:underline font-poppins"
                  onClick={() => navigate('/account-settings/organization')}
                >
                  Go to Organization Settings
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            <Card className="border-[#E5DEFF] shadow-md">
              <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
                <CardTitle className="text-[#6E59A5] font-poppins">Subscription Plan</CardTitle>
                <CardDescription className="text-[#8E9196] font-poppins">
                  Manage your subscription and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <button 
                  className="text-[#9b87f5] hover:underline font-poppins"
                  onClick={() => navigate('/account-settings/plan')}
                >
                  Go to Plan Settings
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
