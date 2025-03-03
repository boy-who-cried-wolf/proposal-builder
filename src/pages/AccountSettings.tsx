
import React, { useState, useEffect } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AccountSettings = () => {
  const { user, signOut, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
      });
      
      toast.success("Account settings saved successfully");
    } catch (error) {
      console.error("Error saving account settings:", error);
      toast.error("Failed to save account settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await requestPasswordReset(user.email);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Failed to send password reset email");
    }
  };

  const handleDeleteAccount = async () => {
    toast.info("Account deletion is not implemented in this demo");
    setShowDeleteDialog(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent>
        <div className="border-b border-border pb-2 mb-6">
          <div className="container px-4 py-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Account Settings</h1>
          </div>
        </div>
        
        <div className="container px-4">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger 
                value="account"
                className={`${location.pathname === "/account-settings" ? "bg-primary text-primary-foreground" : ""}`}
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="organization" 
                onClick={() => navigate("/account-settings/organization")}
                className={`${location.pathname === "/account-settings/organization" ? "bg-primary text-primary-foreground" : ""}`}
              >
                Organization
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                onClick={() => navigate("/account-settings/plan")}
                className={`${location.pathname === "/account-settings/plan" ? "bg-primary text-primary-foreground" : ""}`}
              >
                Plan
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">Loading account settings...</div>
              ) : (
                <>
                  <div className="grid gap-4 max-w-xl">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <Input 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your first name" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <Input 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Your last name" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <Input 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-muted/30" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email address cannot be changed.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-8 border-t max-w-xl">
                    <h2 className="text-xl font-semibold mb-4">Security</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Button variant="outline" onClick={handleRequestPasswordReset}>
                          Reset Password
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          You'll receive an email with instructions to reset your password.
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                          Delete Account
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          This action cannot be undone. All your data will be permanently deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all of your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainContent>
    </div>
  );
};

export default AccountSettings;
