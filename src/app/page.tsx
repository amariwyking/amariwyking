
import IntroBio from "./components/landing/IntroBio";
import IntroHook from "./components/landing/IntroHook";
import ProfilePic from "./components/landing/ProfilePic";

export default function Home() {
  return (
    <div className="flex h-full justify-center items-center w-full sm:px-8">
      <div className="flex w-full max-w-7xl lg:px-8">
        <div className="relative flex-auto w-full">
          <div className='flex align-middle justify-center sm:px-8 mt-4'>
            <div className="grid md:grid-cols-2 mx-auto w-full md:px-24 lg:px-32">
              <ProfilePic />
              <IntroHook />
              <IntroBio />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}