import { useState } from "react";
import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

export default function Settings({ user, onUpdate }: SettingsProps) {
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || "");
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiRequest("POST", "/api/auth/github", {
        userId: user.id,
        githubUsername,
        githubToken: githubToken || user.githubToken
      });
      
      const data = await response.json();
      onUpdate(data.user);
      
      toast({
        title: "Settings saved",
        description: "Your GitHub settings have been updated."
      });
      
      // Clear token field for security
      setGithubToken("");
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please check your GitHub credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Sign in Required</h2>
        <p>Please sign in to access settings</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.username} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={user.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" value={user.avatarUrl || ""} readOnly />
                </div>
                <Button type="button" disabled className="mt-2">
                  Update Account (Coming Soon)
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Connect your GitHub account for repository tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveGitHub}>
                <div className="space-y-2">
                  <Label htmlFor="github-username">GitHub Username</Label>
                  <Input 
                    id="github-username" 
                    value={githubUsername} 
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Your GitHub username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-token">GitHub Access Token</Label>
                  <Input 
                    id="github-token" 
                    type="password"
                    value={githubToken} 
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder={user.githubToken ? "••••••••••••••••" : "Enter a new GitHub token"}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Create a personal access token with 'repo' scope from GitHub settings.
                    Leave blank to keep your existing token.
                  </p>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={loading || !githubUsername}>
                    {loading ? (
                      <>
                        <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : "Save GitHub Settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive daily digests of your GitHub activity
                    </p>
                  </div>
                  <Switch id="email-notifications" disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show notifications in your browser
                    </p>
                  </div>
                  <Switch id="browser-notifications" disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inactivity-reminders">Inactivity Reminders</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remind you when repositories become inactive
                    </p>
                  </div>
                  <Switch id="inactivity-reminders" disabled />
                </div>
                <Button disabled className="mt-2">
                  Save Notification Settings (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" disabled>Light</Button>
                    <Button variant="outline" className="flex-1" disabled>Dark</Button>
                    <Button variant="outline" className="flex-1" disabled>System</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Minimize animations throughout the application
                    </p>
                  </div>
                  <Switch id="reduced-motion" disabled />
                </div>
                <Button disabled className="mt-2">
                  Save Appearance Settings (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
