import { GoogleLogin } from "@react-oauth/google";

function GoogleSection({ onCredential }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs uppercase tracking-widest text-gray-400">or</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(response) => onCredential(response.credential)}
          onError={() => console.error("Google sign-in was cancelled or failed")}
          text="continue_with"
          shape="pill"
          theme="outline"
          width="320"
        />
      </div>
    </div>
  );
}

export default GoogleSection;