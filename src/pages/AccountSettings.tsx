
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  
  // Account settings state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  // Organization settings state
  const [companyName, setCompanyName] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [clientRate, setClientRate] = useState(0);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  // Fetch user profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFirstName(data.first_name || "");
            setLastName(data.last_name || "");
            // Additional fields would be loaded here
            setCompanyName(data.company_name || "");
            setHourlyRate(data.hourly_rate || 0);
            setClientRate(data.client_rate || 0);
            setKnowledgeBase(data.knowledge_base || "");
            setServices(data.services || []);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Account settings updated successfully");
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("Failed to update account settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          hourly_rate: hourlyRate,
          client_rate: clientRate,
          knowledge_base: knowledgeBase,
          services: services,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Organization settings updated successfully");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    if (newService.trim() !== "") {
      setServices([...services, newService]);
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would need additional confirmation and backend logic
    toast.error("Account deletion requires additional confirmation. Please contact support.");
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
      />
      <div className="flex w-full h-screen bg-white max-md:flex-col">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Header section similar to Dashboard */}
          <div className="border-b border-black h-[69px] flex items-center px-6 justify-between">
            <div>
              <h1 className="text-xl font-bold">Account Settings</h1>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="account">Account Settings</TabsTrigger>
                <TabsTrigger value="organization">Organization Settings</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <Input 
                          id="firstName" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <Input 
                          id="lastName" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        disabled 
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveAccount} disabled={loading}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Password Reset</p>
                      <Button 
                        variant="outline" 
                        onClick={handleRequestPasswordReset}
                        disabled={loading}
                      >
                        Send Password Reset Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organization" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>Manage your organization details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                      <Input 
                        id="companyName" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</label>
                        <Input 
                          id="hourlyRate" 
                          type="number" 
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="clientRate" className="text-sm font-medium">Client Rate ($)</label>
                        <Input 
                          id="clientRate" 
                          type="number" 
                          value={clientRate}
                          onChange={(e) => setClientRate(Number(e.target.value))} 
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveOrganization} disabled={loading}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Add services you offer to clients</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add a new service"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                      />
                      <Button onClick={handleAddService}>Add</Button>
                    </div>
                    {services.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {services.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{service}</span>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleRemoveService(index)}
                              className="h-8 w-8 p-0"
                            >
                              &times;
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No services added yet</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveOrganization} disabled={loading}>
                      Save Services
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Knowledge Base</CardTitle>
                    <CardDescription>Customize how the AI generates proposals for you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Add information about your business, preferred style, tone, specific terminology, etc."
                      className="min-h-[150px]"
                      value={knowledgeBase}
                      onChange={(e) => setKnowledgeBase(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveOrganization} disabled={loading}>
                      Save Knowledge Base
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="plan" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Free Plan */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle>Free</CardTitle>
                      <CardDescription>Get started for free</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">$0</span>
                        <span className="text-gray-500 ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>3 proposals</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copy to Figma</span>
                        </li>
                        <li className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>AI Assistant</span>
                        </li>
                        <li className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>Beta features</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">Current Plan</Button>
                    </CardFooter>
                  </Card>

                  {/* Freelancer Plan */}
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle>Freelancer</CardTitle>
                      <CardDescription>Perfect for independent professionals</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">$29</span>
                        <span className="text-gray-500 ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>5 proposals/month</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copy to Figma</span>
                        </li>
                        <li className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>AI Assistant</span>
                        </li>
                        <li className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          <span>Beta features</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Upgrade</Button>
                    </CardFooter>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For businesses and agencies</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">$79</span>
                        <span className="text-gray-500 ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Unlimited proposals</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Copy to Figma</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>AI Assistant</span>
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Exclusive beta features</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Upgrade</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
