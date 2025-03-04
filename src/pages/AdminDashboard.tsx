
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsers, createUserManually, deleteUser, updateUserPlan, checkAndDowngradeExpiredSubscriptions } from '@/integrations/supabase/adminService';
import { getUserProfile } from '@/integrations/supabase/profileService';
import { toast } from 'sonner';
import { Loader2, UserPlus, Trash2, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [checkingExpired, setCheckingExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isAdmin: false
  });

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const profile = await getUserProfile(user.id);
        if (!profile.is_admin) {
          toast.error("You don't have permission to access this page");
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        fetchUsers();
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Error checking permissions");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setRefreshing(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setProcessingUser('new');
      await createUserManually(newUser);
      toast.success(`User ${newUser.email} created successfully`);
      setShowCreateUserDialog(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isAdmin: false
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        setProcessingUser(userId);
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      } finally {
        setProcessingUser(null);
      }
    }
  };

  const handleUpdatePlan = async (userId: string, planId: string) => {
    try {
      setProcessingUser(userId);
      await updateUserPlan(userId, planId);
      fetchUsers();
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleCheckExpiredSubscriptions = async () => {
    try {
      setCheckingExpired(true);
      const result = await checkAndDowngradeExpiredSubscriptions();
      if (result.success) {
        toast.success("Expired subscriptions processed successfully");
      } else {
        toast.error(`Failed to process expired subscriptions: ${result.message}`);
      }
      fetchUsers();
    } catch (error: any) {
      console.error("Error checking expired subscriptions:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setCheckingExpired(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 font-poppins text-gray-700">Checking permissions...</span>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null; // This should never render as we redirect in useEffect
  }

  return (
    <Layout>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-poppins text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} disabled={refreshing} variant="outline" className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#E5DEFF] hover:text-[#7E69AB]">
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button onClick={() => setShowCreateUserDialog(true)} className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleCheckExpiredSubscriptions}
              disabled={checkingExpired}
              className="bg-[#F1F0FB] text-[#6E59A5] hover:bg-[#E5DEFF]"
            >
              {checkingExpired ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Check Expired Subscriptions"
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-[#F1F0FB] mb-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">Users</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="pt-4">
            <Card className="border-[#E5DEFF] shadow-md">
              <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
                <CardTitle className="text-[#6E59A5] font-poppins">Manage Users</CardTitle>
                <CardDescription className="text-[#8E9196] font-poppins">
                  View and manage all users in the system. You can edit their subscription plan, delete accounts, or add new users.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5DEFF]">
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Name</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Email</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Plan</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Status</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Expiration</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Admin</th>
                        <th className="text-left p-3 font-poppins text-[#6E59A5]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-3 text-center text-[#8E9196] font-poppins">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map(user => {
                          const subscription = user.subscriptions ? user.subscriptions[0] : null;
                          const planId = subscription?.plan_id || 'free';
                          const status = subscription?.status || 'inactive';
                          
                          return (
                            <tr key={user.id} className="border-b border-[#E5DEFF] hover:bg-[#F1F0FB]">
                              <td className="p-3 font-poppins">
                                {user.first_name} {user.last_name}
                              </td>
                              <td className="p-3 font-poppins">{user.email}</td>
                              <td className="p-3">
                                <Select
                                  defaultValue={planId}
                                  onValueChange={(value) => handleUpdatePlan(user.id, value)}
                                  disabled={processingUser === user.id}
                                >
                                  <SelectTrigger className="w-[130px] border-[#E5DEFF] text-[#6E59A5] font-poppins">
                                    <SelectValue placeholder="Select Plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="freelancer">Freelancer</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-3">
                                <Badge variant={status === 'active' ? 'default' : 'secondary'} className={status === 'active' ? 'bg-[#F2FCE2] text-green-700' : 'bg-[#F1F0FB] text-[#8E9196]'}>
                                  {status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="p-3 font-poppins text-[#8E9196]">
                                {subscription?.current_period_end ? (
                                  new Date(subscription.current_period_end).toLocaleDateString()
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td className="p-3">
                                {user.is_admin ? (
                                  <Badge variant="outline" className="border-[#9b87f5] text-[#6E59A5]">Admin</Badge>
                                ) : (
                                  <span className="text-[#8E9196] font-poppins">No</span>
                                )}
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={processingUser === user.id}
                                  className="bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                  {processingUser === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="pt-4">
            <Card className="border-[#E5DEFF] shadow-md">
              <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
                <CardTitle className="text-[#6E59A5] font-poppins">User Statistics</CardTitle>
                <CardDescription className="text-[#8E9196] font-poppins">
                  Overview of user accounts and subscription statistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Total Users" 
                    value={users.length} 
                    description="Total registered users" 
                  />
                  <StatCard 
                    title="Paid Plans" 
                    value={users.filter(u => 
                      u.subscriptions && 
                      u.subscriptions[0] && 
                      u.subscriptions[0].plan_id !== 'free' && 
                      u.subscriptions[0].status === 'active'
                    ).length} 
                    description="Users on paid plans" 
                  />
                  <StatCard 
                    title="Admins" 
                    value={users.filter(u => u.is_admin).length} 
                    description="Users with admin rights" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="sm:max-w-[425px] border-[#E5DEFF]">
          <DialogHeader>
            <DialogTitle className="text-[#6E59A5] font-poppins">Create New User</DialogTitle>
            <DialogDescription className="text-[#8E9196] font-poppins">
              Add a new user account to the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="firstName" className="text-[#6E59A5] font-poppins">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                    className="border-[#E5DEFF] focus-visible:ring-[#9b87f5]"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="lastName" className="text-[#6E59A5] font-poppins">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                    className="border-[#E5DEFF] focus-visible:ring-[#9b87f5]"
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="text-[#6E59A5] font-poppins">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  className="border-[#E5DEFF] focus-visible:ring-[#9b87f5]"
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="text-[#6E59A5] font-poppins">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength={6}
                  className="border-[#E5DEFF] focus-visible:ring-[#9b87f5]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  className="h-4 w-4 rounded border-[#9b87f5] text-[#9b87f5] focus:ring-[#9b87f5]"
                />
                <Label htmlFor="isAdmin" className="text-[#6E59A5] font-poppins">Make this user an admin</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateUserDialog(false)}
                className="border-[#E5DEFF] text-[#8E9196] hover:bg-[#F1F0FB]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={processingUser === 'new'}
                className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
              >
                {processingUser === 'new' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Simple stat card component
const StatCard = ({ title, value, description }: { title: string, value: number, description: string }) => (
  <div className="bg-white rounded-lg border border-[#E5DEFF] p-6 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-lg font-medium text-[#6E59A5] font-poppins">{title}</h3>
    <p className="text-3xl font-bold mt-2 text-[#1A1F2C] font-poppins">{value}</p>
    <p className="text-sm text-[#8E9196] mt-1 font-poppins">{description}</p>
  </div>
);

export default AdminDashboard;
