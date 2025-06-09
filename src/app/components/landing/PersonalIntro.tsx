import IntroBio from "./IntroBio";
import IntroHook from "./IntroHook";
import ProfilePic from "./ProfilePic";

export default function PersonalIntro() {
  return (
    <div className="flex min-h-screen items-center justify-center py-16 lg:py-32">
      <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto px-8 md:px-24 lg:px-32">
        <IntroHook />
        <ProfilePic />
        <IntroBio />
      </div>
    </div>
  );
}