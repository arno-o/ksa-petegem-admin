import { cn } from "~/lib/utils"
import { useState } from "react"
import { useNavigate } from "react-router"
import { UserAuth } from "~/context/AuthContext"
import { toast } from "sonner"; // Import toast from sonner
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const { signInUser } = UserAuth();

  interface SignInResult {
    success: boolean;
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "E-mailadres is vereist.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Voer een geldig e-mailadres in.";
    }

    if (!password.trim()) {
      newErrors.password = "Wachtwoord is vereist.";
    }

    setFormErrors(newErrors); // Update the errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Prevent default HTML5 validation
    setLoading(true);
    setFormErrors({}); // Clear previous errors

    // Run validation before attempting to sign in
    if (!validateForm()) {
      toast.error("Vul alle verplichte velden correct in."); // Show toast for validation failure
      setLoading(false); // Stop loading if validation fails
      return; // Stop the function if validation fails
    }

    try {
      const result: SignInResult | undefined = await signInUser(email, password);
      if (result?.success) {
        toast.success("Succesvol aangemeld!"); // Show success toast
        navigate("/berichten");
      } else {
        // This case might be for specific backend errors not caught by the general catch block
        toast.error("Aanmelden mislukt. Controleer uw e-mail en wachtwoord.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign in error:", error);
        toast.error(`Fout bij aanmelden: ${error.message}`); // Show specific error message
      } else {
        console.error("Sign in error:", error);
        toast.error("Er is een onverwachte fout opgetreden tijdens het aanmelden.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Meld je aan</CardTitle>
          <CardDescription>
            Zonder login ben je hier niks mee..
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} noValidate> {/* Add noValidate to disable browser's default validation */}
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: "" })); // Clear error on change
                  }}
                  id="email"
                  type="email"
                  placeholder="tjeuden@gasolina.be"
                  className={`${formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Wachtwoord</Label> {/* Changed label to Dutch */}
                </div>
                <div className="relative"> {/* Added relative positioning for the icon */}
                  <Input
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`${formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""} pr-10`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-neutral-500" />
                    )}
                  </Button>
                </div>
                {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Aanmelden..." : "Aanmelden"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
