import type React from "react";
import HeroSection from "./HeroSection";
import Statistics from "./Statistics";
import FeaturedInscriptionsCarousel from "./FeaturedInscriptionsCarousel";
import HowItWork from "./HowItWork";
import ReactActivity from "./RecentActivity";
import WhyJoinSection from "./WhyJoinSection";
import CallToAction from "./CallToAction";
import Footer from "./Footer";
import FadeInWrapper from "../../components/FadeInWrapper";
import "../../styles/fadeIn.css";
import { useEffect } from "react";
import axios from "axios";
import { getEnvConfig } from "@/config/env";
import { getCookie } from "@/utils/Auth/auth";


const HomePage: React.FC = () => {
  
  useEffect(() => {
    const { backendApiUrl } = getEnvConfig();
    
     if (!getCookie('XSRF-TOKEN')) {
      
      axios.get(`${backendApiUrl}oauth2/login/csrf-token`, {
        withCredentials: true
      });

  }},[])

  return (
    <>
      {/* Hero Section */}
      <FadeInWrapper>
        <HeroSection/>
      </FadeInWrapper>

      {/* Statistics */}
      <FadeInWrapper>
        <Statistics/>
      </FadeInWrapper>

      {/* Featured Inscriptions Carousel */}
      <FadeInWrapper>
        <FeaturedInscriptionsCarousel/>
      </FadeInWrapper>

      {/* How It Works */}
      <FadeInWrapper>
        <HowItWork/>
      </FadeInWrapper>

      {/* Recent Activity */}
      <FadeInWrapper>
        <ReactActivity/>
      </FadeInWrapper>

      {/* Why Join Section */}
      <FadeInWrapper>
        <WhyJoinSection/>
      </FadeInWrapper>

      {/* Call to Action */}
      <FadeInWrapper>
        <CallToAction/>
      </FadeInWrapper>

      {/* Footer */}
      <FadeInWrapper>
        <Footer/>
      </FadeInWrapper>
    </>
  );
};

export default HomePage;