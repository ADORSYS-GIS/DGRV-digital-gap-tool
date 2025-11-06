import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/shared/useAuth";
import { ROLES } from "@/constants/roles";

interface OnboardingCompletionProps {
  isTransitioning: boolean;
  handlePrevious: () => void;
}

export default function OnboardingCompletion({
  isTransitioning,
  handlePrevious,
}: OnboardingCompletionProps) {
  const { roles } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (roles.includes(ROLES.ADMIN)) {
      navigate("/admin/dashboard");
    } else if (roles.includes(ROLES.ORG_ADMIN)) {
      navigate("/second-admin/dashboard");
    } else if (roles.includes(ROLES.COOP_ADMIN)) {
      navigate("/third-admin/dashboard");
    } else if (roles.includes(ROLES.Org_User)) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl p-12 text-center transition-all duration-500 ease-in-out ${
        isTransitioning
          ? "opacity-0 scale-95 translate-x-8"
          : "opacity-100 scale-100 translate-x-0"
      }`}
    >
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="h-16 w-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        You're Ready to Get Started!
      </h1>

      <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
        Your digitalization journey begins now. Let's transform your cooperative
        with data-driven insights and strategic planning.
      </p>

      <button
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto group"
      >
        Begin Your Journey
        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
      </button>

      <button
        onClick={handlePrevious}
        className="mt-6 text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center mx-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to steps
      </button>
    </div>
  );
}
