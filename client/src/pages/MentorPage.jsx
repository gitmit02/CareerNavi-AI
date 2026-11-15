import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import MentorChatWindow from "../components/mentor/MentorChatWindow";

const MentorPage = () => {
  return (
    <DashboardLayout title="AI Career Mentor" subtitle="Ask anything about careers, skills, or internships. No history is saved.">
      <Card noPadding className="h-[calc(100vh-13rem)] lg:h-[calc(100vh-11rem)] p-4 sm:p-5 flex flex-col">
        <MentorChatWindow />
      </Card>
    </DashboardLayout>
  );
};

export default MentorPage;
