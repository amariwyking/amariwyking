import ResumeInteractive from '@/app/components/resume/ResumeInteractive';
import { resumeData } from '@/app/lib/resume-data';


export default function InteractiveResumePage() {
  return (
    <div className='col-span-2'>
      <ResumeInteractive data={resumeData} />
    </div>
  );
}