import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { translateSupabaseError } from "~/utils/errorTranslator";

import { toast } from "sonner"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { UserAuth } from "~/context/AuthContext"
import { Separator } from "~/components/ui/separator"

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({}); // State for form validation errors
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to toggle password visibility

  const navigate = useNavigate();

  const { signUpNewUser } = UserAuth();

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
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    if (!validateForm()) {
      toast.error("Vul alle verplichte velden correct in.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpNewUser(email, password, firstName, lastName);

      if (result.success) {
        toast.success("Account succesvol aangemaakt!");
        navigate("/berichten", { viewTransition: true });
      } else {
        const translatedError = translateSupabaseError(result.error.code);
        toast.error(`Registratie mislukt:`, {
          description: `${translatedError}`
        });
      }
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      toast.error("Er is een onverwachte fout opgetreden tijdens de registratie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Maak een account aan</h1>
        <p className="text-muted-foreground text-sm text-balance">
          No broke boys.. no new friends..
        </p>
      </div>

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
        
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Account aanmaken..." : "Account maken"}
          </Button>
        </div>
      </div>
      <Separator />
      <div className="text-center text-sm">
        Heb je al een account?{" "}
        <Link to="/login" className="underline underline-offset-4" viewTransition>Log in</Link>
      </div>
    </form>
  )
}