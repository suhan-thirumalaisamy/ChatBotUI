import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { signIn, signUp, confirmSignUp, resendConfirmationCode } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Confirmation Form State
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(signInData.username, signInData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await signUp(signUpData.username, signUpData.email, signUpData.password);
      setPendingUsername(signUpData.username);
      setNeedsConfirmation(true);
      setSuccess('Account created! Please check your email for a confirmation code.');
      setSignUpData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await confirmSignUp(pendingUsername, confirmationCode);
      setNeedsConfirmation(false);
      setSuccess('Email confirmed! You can now sign in with your credentials.');
      setConfirmationCode('');
      setPendingUsername('');
      toast({
        title: "Email Confirmed!",
        description: "Your account has been verified. Please sign in.",
      });
    } catch (err: any) {
      setError(err.message || 'Invalid confirmation code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await resendConfirmationCode(pendingUsername);
      setSuccess('Confirmation code resent! Please check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md" style={{ backgroundColor: '#f8d7da'}}>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* <Zap className="h-6 w-6 text-blue-600" /> */}
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEVHcEz/Clv/C1z/AFr/AFv/BFv/JGj/Blv/BFr/AVf/AFX/AE3/S3v/wM3/mLD/b5L+//7+2+H/Y4r/MW3/AFrLm4l5AAAAFXRSTlMATJXI/+oTpo0i/////////////8OBOylAAAAA/klEQVR4AWySAQJAIAxFkx+sAO5/VkvVBg/Aq22LUTS2BeBa25gfuh6KvjMvBrywz+EOH5yaZMQvYx0PgLz3RP6GkClzOIDCNE1zPPFlKYqT/GhZ13Xb18ziVaYdtFAMkiC9CGFjkpGn6FmACP5mjsKep+D+auG+9XGSOQuNsW8BLEgS1rRaoIhfmSMLrXFKoMAsm0wWWwH8lLmh8itsB4ngPkIkUA1xvquId5LD+S0zNaoIw7tRkbtMlEaZb6P0asliiaBb3ctyK2GS+84w9iXQXns91F8OYWZyXB/vFyq/XAnCIEP5obtGKNkTnXHALsXIeqRkXkT2F2HFyP4Au4kbEfvki2cAAAAASUVORK5CYII=" alt="logo" />
            </div>
            <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
            <CardDescription className='text-black-600'>
              We sent a confirmation code to your email address. Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfirmSignUp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: '#ff3c5a'}}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Email
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Didn't receive the code? Resend
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" style={{ backgroundColor: '#f8d7da'}}>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* <Zap className="h-6 w-6 text-blue-600" /> */}
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEVHcEz/Clv/C1z/AFr/AFv/BFv/JGj/Blv/BFr/AVf/AFX/AE3/S3v/wM3/mLD/b5L+//7+2+H/Y4r/MW3/AFrLm4l5AAAAFXRSTlMATJXI/+oTpo0i/////////////8OBOylAAAAA/klEQVR4AWySAQJAIAxFkx+sAO5/VkvVBg/Aq22LUTS2BeBa25gfuh6KvjMvBrywz+EOH5yaZMQvYx0PgLz3RP6GkClzOIDCNE1zPPFlKYqT/GhZ13Xb18ziVaYdtFAMkiC9CGFjkpGn6FmACP5mjsKep+D+auG+9XGSOQuNsW8BLEgS1rRaoIhfmSMLrXFKoMAsm0wWWwH8lLmh8itsB4ngPkIkUA1xvquId5LD+S0zNaoIw7tRkbtMlEaZb6P0asliiaBb3ctyK2GS+84w9iXQXns91F8OYWZyXB/vFyq/XAnCIEP5obtGKNkTnXHALsXIeqRkXkT2F2HFyP4Au4kbEfvki2cAAAAASUVORK5CYII=" alt="logo" />
          </div>
          <CardTitle className="text-2xl">Rebel Energy</CardTitle>
          {/* <CardDescription>
            Sign in to access your utility customer support dashboard
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signin-username">Username</Label>
                  <Input
                    id="signin-username"
                    type="text"
                    placeholder="Enter your username"
                    value={signInData.username}
                    onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: '#ff3c5a'}}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: '#ff3c5a'}}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}