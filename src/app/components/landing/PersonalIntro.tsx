import NamePlate from "./NamePlate";
import IntroBio from "./IntroBio";
import ProfilePic from "./ProfilePic";

export default function PersonalIntro() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-32 pb-16 md:pt-40 lg:pt-48 lg:pb-32">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-7xl mx-0 sm:mx-auto md:px-24 lg:px-32">
        <ProfilePic />
        <NamePlate />
        <IntroBio />
      </div>
    </div>
  );
}