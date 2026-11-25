import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";
export const metadata = { title: "Artist Login" };
export default function Page() { return <Suspense><LoginForm /></Suspense>; }
