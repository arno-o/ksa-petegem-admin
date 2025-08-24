import { toast } from "sonner";
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Eye, EyeOff } from "lucide-react"
import { UserAuth } from "~/context/AuthContext"
import { translateSupabaseError } from "~/utils/errorTranslator";

import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

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

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    if (!validateForm()) {
      toast.error("Vul alle verplichte velden correct in.");
      setLoading(false);
      return;
    }

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        toast.info("Succesvol aangemeld");
        navigate("/");
      } else {
        const translatedError = translateSupabaseError(result.error.code);
        toast.error("Aanmelden mislukt.", {
          description: `${translatedError}`
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Sign in error:", error);
        toast.error("Fout bij aanmelden:", {
          description: error.message
        });
      } else {
        console.error("Sign in error:", error);
        toast.error("Er is een onverwachte fout opgetreden tijdens het aanmelden.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-6">

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Log in met jouw account</h1>
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

        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aanmelden..." : "Aanmelden"}
          </Button>
        </div>
        <Separator />
        <div className="text-center text-sm">
          Nog geen account?{" "}
          <Link to="/register" className="underline underline-offset-4" viewTransition>Registreer</Link>
        </div>
      </div>
    </form>
  )
}
