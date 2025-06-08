import { cn } from "~/lib/utils"
import { useState } from "react"
import { useNavigate } from "react-router"
import { UserAuth } from "~/context/AuthContext"

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const { session, signInUser } = UserAuth();
  console.log(session);

  interface SignInResult {
    success: boolean;
    // Add other properties if the result object has more
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const result: SignInResult | undefined = await signInUser(email, password);
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
          <CardTitle>Meld je aan</CardTitle>
          <CardDescription>
            Zonder login ben je hier niks mee..
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="arno@ksapetegem.be"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Aanmelden
                </Button>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
