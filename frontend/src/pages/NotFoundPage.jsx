import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";

const NotFoundPage = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
    <Logo className="mb-10" />
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface2 text-muted mb-5">
      <Compass size={28} />
    </div>
    <h1 className="font-display text-3xl font-bold text-ink mb-2">You've gone off-path</h1>
    <p className="text-muted max-w-sm mb-8">
      This route doesn't exist. Let's get you back on track.
    </p>
    <Link to="/">
      <Button>Back to home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
