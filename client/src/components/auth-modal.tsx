import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const confirmSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("signin");
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, confirmSignUp, forgotPassword, resetPassword } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const confirmForm = useForm({
    resolver: zodResolver(confirmSchema),
    defaultValues: { email: pendingEmail, confirmationCode: "" },
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", confirmationCode: "", newPassword: "", confirmNewPassword: "" },
  });

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      setPendingEmail(data.email);
      confirmForm.setValue("email", data.email);
      setActiveTab("confirm");
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation code.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (data: z.infer<typeof confirmSchema>) => {
    setIsLoading(true);
    try {
      await confirmSignUp(data.email, data.confirmationCode);
      toast({
        title: "Email verified!",
        description: "Your account has been verified. You can now sign in.",
      });
      setActiveTab("signin");
      signInForm.setValue("email", data.email);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid confirmation code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setPendingEmail(data.email);
      resetForm.setValue("email", data.email);
      setActiveTab("reset");
      toast({
        title: "Check your email",
        description: "We've sent you a password reset code.",
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send reset code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email, data.confirmationCode, data.newPassword);
      toast({
        title: "Password reset!",
        description: "Your password has been updated. You can now sign in.",
      });
      setActiveTab("signin");
      signInForm.setValue("email", data.email);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access Your Account</DialogTitle>
          <DialogDescription>
            Sign in to your utility account for personalized support
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  {...signInForm.register("email")}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{signInForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...signInForm.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setActiveTab("forgot")}
              >
                Forgot your password?
              </Button>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Enter your full name"
                  {...signUpForm.register("name")}
                />
                {signUpForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{signUpForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  {...signUpForm.register("email")}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password (min 8 characters)"
                  {...signUpForm.register("password")}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  {...signUpForm.register("confirmPassword")}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="confirm" className="space-y-4">
            <form onSubmit={confirmForm.handleSubmit(handleConfirm)} className="space-y-4">
              <div className="text-sm text-slate-600">
                Enter the 6-digit code sent to {pendingEmail}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-email">Email</Label>
                <Input
                  id="confirm-email"
                  type="email"
                  readOnly
                  {...confirmForm.register("email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-code">Confirmation Code</Label>
                <Input
                  id="confirm-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...confirmForm.register("confirmationCode")}
                />
                {confirmForm.formState.errors.confirmationCode && (
                  <p className="text-sm text-red-500">{confirmForm.formState.errors.confirmationCode.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="forgot" className="space-y-4">
            <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <div className="text-sm text-slate-600">
                Enter your email to receive a password reset code
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  {...forgotForm.register("email")}
                />
                {forgotForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Code
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setActiveTab("signin")}
              >
                Back to Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset" className="space-y-4">
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="text-sm text-slate-600">
                Enter the code and your new password
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  readOnly
                  {...resetForm.register("email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <Input
                  id="reset-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...resetForm.register("confirmationCode")}
                />
                {resetForm.formState.errors.confirmationCode && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.confirmationCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  placeholder="Enter new password"
                  {...resetForm.register("newPassword")}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirm New Password</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  placeholder="Confirm new password"
                  {...resetForm.register("confirmNewPassword")}
                />
                {resetForm.formState.errors.confirmNewPassword && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.confirmNewPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}