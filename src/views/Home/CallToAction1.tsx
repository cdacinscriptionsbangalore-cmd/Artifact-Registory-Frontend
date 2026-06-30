import type React from "react";
import { NavLink } from "react-router-dom";
import { Parallax } from "react-parallax";
import banner3 from "@assets/banner3.jpg";
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { LogIn } from "lucide-react";
const CallToAction: React.FC = () => {
    return (
        <>
            <div className="parallax-bg-pc">
                {/* <Parallax className="my-20" blur={0} bgImage={banner3} bgImageAlt="the cat" strength={600} style={{ borderRadius: "30px" }}> */}
                <section className="py-20 flex justify-center">
                    {/* <section className="py-20 flex justify-center" style={{
                    background: "linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%,rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.7) 100%)"
                }}> */}
                    <div className="backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col justify-between" style={{ background: "white" }}>
                        <h3 className="text-3xl font-bold mb-4">Ready to Make History?</h3>
                        <p className="text-xl text-primary-text-dark/45 mb-8 max-w-2xl mx-auto text-secondary-dark">
                            Every inscription tells a story. Every translation unlocks wisdom.
                            Every contribution helps preserve our shared human heritage.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <NavLink data-testid="cta-contribute-btn" to="/upload" className="flex justify-center items-center gap-2 bg-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all text-primary-text transform hover:scale-105 shadow-lg">
                                <VolunteerActivismOutlinedIcon />
                                Start Contributing
                            </NavLink>
                            {/* <button className="flex justify-center items-center gap-2 border border-slate-600 hover:bg-slate-800/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all cursor-pointer" style={{ backgroundColor: "white" }}>
                                <SchoolOutlinedIcon />
                                Learn More
                            </button> */}
                        </div>
                    </div>
                </section>
                {/* </Parallax> */}
            </div>
            <div className="parallax-bg-mob">
                {/* <Parallax className="my-20" blur={0} bgImage={''} bgImageAlt="the cat" strength={600} style={{ borderRadius: "30px" }}> */}
                <section className="py-20 flex justify-center">
                    <div className="backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col justify-between" style={{ background: "white" }}>
                        <h3 className="text-3xl font-bold mb-4">Ready to Make History?</h3>
                        <p className="text-xl text-primary-text-dark/45 mb-8 max-w-2xl mx-auto text-secondary-dark">
                            Every inscription tells a story. Every translation unlocks wisdom.
                            Every contribution helps preserve our shared human heritage.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <NavLink to="/upload" className="flex justify-center items-center gap-2  bg-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all text-primary-text transform hover:scale-105 shadow-lg">
                                <VolunteerActivismOutlinedIcon />
                                Start Contributing
                            </NavLink>
                            {/* <button className="flex justify-center items-center gap-2 border border-slate-600 hover:bg-slate-800/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all cursor-pointer" style={{ backgroundColor: "white" }}>
                                <SchoolOutlinedIcon />
                                Learn More
                            </button> */}
                        </div>
                    </div>
                </section>
                {/* </Parallax> */}
            </div>
        </>
    )

}
export default CallToAction;