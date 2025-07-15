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
import { cn } from "~/lib/utils"

import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { UserAuth } from "~/context/AuthContext"
import { Separator } from "~/components/ui/separator"
import { toast } from "sonner"; // Import toast from sonner
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

export function RegisterForm({className, ...props}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({}); // State for form validation errors
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility

  const navigate = useNavigate();

  const { signUpNewUser } = UserAuth();

  interface SignUpResult {
    success: boolean;
    // Add other properties if the result object has more
  }

  /**
   * Validates the registration form fields.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "E-mailadres is vereist.";
    } else if (!/\S+@\S+\.\S+/.test(email)) { // Basic email format validation
      newErrors.email = "Voer een geldig e-mailadres in.";
    }

    if (!password.trim()) {
      newErrors.password = "Wachtwoord is vereist.";
    } else if (password.length < 6) { // Example: minimum password length
      newErrors.password = "Wachtwoord moet minimaal 6 tekens lang zijn.";
    }

    if (!firstName.trim()) {
      newErrors.firstName = "Voornaam is vereist.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Familienaam is vereist.";
    }

    setFormErrors(newErrors); // Update the errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Prevent default HTML5 validation
    setLoading(true);
    setFormErrors({}); // Clear previous errors

    // Run validation before attempting to sign up
    if (!validateForm()) {
      toast.error("Vul alle verplichte velden correct in."); // Show toast for validation failure
      setLoading(false); // Stop loading if validation fails
      return; // Stop the function if validation fails
    }

    try {
      const result: SignUpResult | undefined = await signUpNewUser(email, password, firstName, lastName);
      if (result?.success) {
        toast.success("Account succesvol aangemaakt!"); // Show success toast
        navigate("/berichten", { viewTransition: true });
      } else {
        // This case might be for specific backend errors not caught by the general catch block
        toast.error("Registratie mislukt. Probeer opnieuw.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign up error:", error);
        toast.error(`Fout bij registreren: ${error.message}`); // Show specific error message
      } else {
        console.error("Sign up error:", error);
        toast.error("Er is een onverwachte fout opgetreden tijdens de registratie.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Maak een account aan</CardTitle>
          <CardDescription>
            #gasolina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  id="email"
                  type="email"
                  className={`${formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Wachtwoord</Label>
                </div>
                <div className="relative">
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
              <div className="flex gap-3">
                <div className="flex flex-col gap-3 flex-1"> {/* Use flex-1 to make them take equal space */}
                  <div className="flex items-center">
                    <Label htmlFor="firstName">Voornaam</Label>
                  </div>
                  <Input
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFormErrors((prev) => ({ ...prev, firstName: "" })); // Clear error on change
                    }}
                    id="firstName"
                    type="text" // Changed type to text for first name
                    className={`${formErrors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                </div>
                <div className="flex flex-col gap-3 flex-1"> {/* Use flex-1 to make them take equal space */}
                  <div className="flex items-center">
                    <Label htmlFor="lastName">Familienaam</Label>
                  </div>
                  <Input
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setFormErrors((prev) => ({ ...prev, lastName: "" })); // Clear error on change
                    }}
                    id="lastName"
                    type="text" // Changed type to text for last name
                    className={`${formErrors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Account aanmaken..." : "Account maken"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Heb je al een account?{" "}
              <Link to="/login" className="underline underline-offset-4" viewTransition>Log in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}