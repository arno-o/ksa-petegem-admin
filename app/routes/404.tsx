import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"

export default function FourOFour() {
    const navigate = useNavigate();

    return (
        <>
            <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="text-center">
                    <p className="text-base font-semibold">404</p>
                    <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                        Pagina niet gevonden
                    </h1>
                    <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                        Sorry, deze pagina bestaat niet. Is jouw URL juist?
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button size={"lg"} variant={"ghost"} onClick={() => navigate("/berichten", { viewTransition: true })}>
                            <ArrowLeft />
                            Ga terug
                        </Button>
                    </div>
                </div>
            </main>
        </>
    )
}