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

export function RegisterForm({className, ...props}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const { signUpNewUser } = UserAuth();

  interface SignUpResult {
    success: boolean;
    // Add other properties if the result object has more
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const result: SignUpResult | undefined = await signUpNewUser(email, password, firstName, lastName);
      if (result?.success) {
        navigate("/berichten");
      } else {
        // Optionally handle the case where result is undefined or success is false
        setError("Sign up failed. Please try again.");
      }
    } catch (error: unknown) {
      // It's good practice to check the type of error if you need to access its properties
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during sign up.");
      }
      console.error("Sign up error:", error);
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
            Zonder login ben je hier niks mee..
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Wachtwoord</Label>
                </div>
                <Input 
                  onChange={(e) => setPassword (e.target.value)}
                  id="password" 
                  type="password" 
                  required />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Voornaam</Label>
                  </div>
                  <Input onChange={(e) => setFirstName(e.target.value)} id="firstName" type="firstName" required />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Familienaam</Label>
                  </div>
                  <Input onChange={(e) => setLastName(e.target.value)} id="lastName" type="lastName" required />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Account maken
                </Button>
              </div>
            </div>
            {error && <p className="text-red-600 mt-4 text-center text-sm">{error}</p>}
            <div className="mt-4 text-center text-sm">
              Heb je al een account?{" "}
              <Link to="/" className="underline underline-offset-4" viewTransition>Log in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
