
import IntroBio from "./components/landing/IntroBio";
import IntroHook from "./components/landing/IntroHook";
import ProfilePic from "./components/landing/ProfilePic";

export default function Home() {
  return (
    <div className='flex align-middle justify-center sm:px-8 mt-9'>
      <div className="grid md:grid-cols-2 mx-auto w-full md:px-24 lg:px-32">
        <ProfilePic />
        <IntroHook />
        <IntroBio />
      </div>
    </div>
  );
}