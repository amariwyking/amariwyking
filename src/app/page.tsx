
import HeroName from "./components/landing/HeroName";
import IntroBio from "./components/landing/IntroBio";
import IntroHook from "./components/landing/IntroHook";
import ProfilePic from "./components/landing/ProfilePic";

export default function Home() {
  return (
    <div className="flex h-full justify-center items-center w-full sm:px-8">
      <HeroName />
      {/* <IntroHook /> */}
      {/* <ProfilePic /> */}
      {/* <IntroBio /> */}
    </div>
  );
}