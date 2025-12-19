import type React from "react";
// import HeroSection from "./HeroSection";
import HeroSection1 from "./HeroSection1";
import Statistics from "./Statistics";
import FeaturedInscriptionsCarousel from "./FeaturedInscriptionsCarousel";
// import HowItWork from "./HowItWork";
import HowItWork1 from "./HowItWork1";
import ReactActivity from "./RecentActivity";
import WhyJoinSection from "./WhyJoinSection";
// import CallToAction from "./CallToAction";
import CallToAction1 from "./CallToAction1";
// import Footer from "./Footer";
import FadeInWrapper from "../../components/FadeInWrapper";
import "../../styles/fadeIn.css";
import Statistics1 from "./Statistics1";
import styles from "./Home.module.css";

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <FadeInWrapper>
        <div className={styles["hero-wrapper"]}>
          <HeroSection1 />
        </div>
        {/* <HeroSection /> */}
      </FadeInWrapper>

      {/* Statistics */}
      <FadeInWrapper>
        <div className={styles["stats-mob"]} >
          <Statistics />
        </div>
        <div className={styles["stats-pc"]} >
          <Statistics1 />
        </div>
      </FadeInWrapper>

      {/* Featured Inscriptions Carousel */}
      <FadeInWrapper>
        <FeaturedInscriptionsCarousel />
      </FadeInWrapper>

      {/* How It Works */}
      <FadeInWrapper>
        {/* <HowItWork /> */}
        <HowItWork1 />
      </FadeInWrapper>

      {/* Recent Activity */}
      {/* <FadeInWrapper>
        <ReactActivity />
      </FadeInWrapper> */}

      {/* Why Join Section */}
      <FadeInWrapper>
        <WhyJoinSection />
      </FadeInWrapper>

      {/* Call to Action */}
      <FadeInWrapper>
        {/* <CallToAction /> */}
        <CallToAction1 />
      </FadeInWrapper>

      {/* Footer */}
      {/* <FadeInWrapper>
        <Footer/>
      </FadeInWrapper> */}
    </>
  );
};

export default HomePage;