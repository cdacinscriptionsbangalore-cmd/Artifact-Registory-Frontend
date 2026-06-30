import { Upload } from "lucide-react"
import { NavLink } from "react-router-dom";
// import { Parallax } from 'react-parallax';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
// import parallaxBg from "@assets/parallaxImages/banner.png";
import cdacRoundLogo from "@assets/cdacroundlogo.png";
const HeroSection = () => {

    return (
        <>
            <div className="parallax-bg-pc">
                {/* <Parallax blur={0} className="parallax-bg" bgImage={parallaxBg} bgImageAlt="the cat" strength={600} > */}
                {/* <section className="relative overflow-hidden" style={{ minHeight: "500px", background: "rgba(0,0,0,0.7)" }}> */}
                <section className="relative overflow-hidden" style={{ minHeight: "500px" }}>
                    <div className="w-full h-full" style={{ minHeight: "inherit", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="text-center mb-12">
                            {/* <img src={cdacRoundLogo} alt="C-DAC Logo" className="mx-auto mb-6 w-28 h-28" /> */}
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#000000]">
                                {/* <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#ffffff]"> */}
                                Let Us Decode Ancient Wisdom Together
                            </h2>
                            <p className="text-xl text-[#000000] max-w-3xl mx-auto mb-8">
                                {/* <p className="text-xl text-[#ffffff] max-w-3xl mx-auto mb-8"> */}
                                Become a part of our community and collaborative platform for archaeological inscriptions.
                                Discover, transcribe, translate, and preserve humanity's written heritage.
                            </p>

                            {/* Search Bar */}
                            {/* <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search inscriptions, locations, or time periods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                    />
                    </div>
                </div> */}

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center text-primary-text">
                                <NavLink to="/upload" className="flex items-center gap-2 bg-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                                    <Upload className="inline w-5 h-5" />
                                    Upload Inscription
                                </NavLink>
                                <NavLink data-testid="hero-explore-btn" to="/feed" className="flex items-center gap-2 bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm ">
                                    <TravelExploreOutlinedIcon />
                                    Explore Collection
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </section>
                {/* </Parallax> */}
            </div>
            <div className="parallax-bg-mob">
                <section className="relative overflow-hidden" style={{ minHeight: "500px" }}>
                    {/* <section className="relative overflow-hidden" style={{ minHeight: "500px" }}> */}
                    <div className="w-full h-full" style={{ minHeight: "inherit", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="text-center my-12">
                            {/* <img src={cdacRoundLogo} alt="C-DAC Logo" className="mx-auto mb-6 w-28 h-28" /> */}
                            {/* <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#000000]"> */}
                            <h2 className="leading-tight text-5xl md:text-6xl font-bold mb-6 text-[#000000]">
                                Let Us Decode Ancient Wisdom Together
                            </h2>
                            {/* <p className="text-xl text-[#000000] max-w-3xl mx-auto mb-8"> */}
                            <p className="text-xl text-[#000000] max-w-3xl mx-auto mb-8">
                                Join the C-DAC's collaborative platform for archaeological inscriptions.
                                Discover, transcribe, translate, and preserve humanity's written heritage.
                            </p>

                            {/* Search Bar */}
                            {/* <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search inscriptions, locations, or time periods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                    />
                    </div>
                </div> */}

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center text-primary-text">
                                <NavLink data-testid="hero-upload-btn" to="/upload" className="flex justify-center items-center gap-2 bg-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                                    <Upload className="inline w-5 h-5" />
                                    Upload Inscription
                                </NavLink>
                                <NavLink to="/feed" className="flex justify-center  items-center gap-2 bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm ">
                                    <TravelExploreOutlinedIcon />
                                    Explore Collection
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default HeroSection;