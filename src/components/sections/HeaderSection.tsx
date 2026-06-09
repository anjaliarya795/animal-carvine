import Dashboard from "../Dashboard";
import FadeUp from "../animations/FadeUp";

const HeaderSection = () => {
  return (
    <section className="flex flex-1 flex-col justify-center pb-6">
      <FadeUp>
        <Dashboard />
      </FadeUp>
    </section>
  );
};

export default HeaderSection;
