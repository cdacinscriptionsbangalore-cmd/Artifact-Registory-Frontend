import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react";
import img1 from "@assets/AncientSanskritStoneInsc.webp"
import img2 from "@assets/tamilCopperPlate.avif"
import img3 from "@assets/mediaPersianInscription.webp"
import { NavLink } from "react-router-dom";

const FeaturedInscriptionsCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const featuredInscriptions = [
        {
            id: 1,
            title: "Ancient Sanskrit Stone Tablet",
            // location: "Hampi, Karnataka",
            // period: "14th Century",
            image: img1,
            description: "Detailed Vijayanagara empire inscription with royal decrees. The Vijayanagara Empire (1336–1646) left behind a vast corpus of inscriptions, primarily in Kannada, Sanskrit, and Telugu, that provide detailed insights into royal decrees, administrative policies, and social regulations. These records, often inscribed on temple walls or copper plates, were key instruments in legitimizing power and recording land grants. ",
            link: "/feed/68c7a90e62ee5a8274fceaac",
            // likes: 234,
            // views: 1542,
            // comments: 45
        },
        {
            id: 2,
            title: "Tamil Copper Plate Inscription",
            // location: "Thanjavur, Tamil Nadu",
            // period: "11th Century",
            image: img2,
            description: "Chola dynasty land grant inscription with detailed genealogy. It provides a detailed, often mythological, genealogy starting from Vishnu, through Brahma, Kashyapa, Surya (the Sun), to Manu, and eventually to the mythical King Chola, and historical rulers like Karikala Chola. It traces the lineage up to Rajaraja I and his son Rajendra Chola I",
            link: "/feed/68c7a9a162ee5a8274fceab0",
            // likes: 189,
            // views: 987,
            // comments: 32
        },
        {
            id: 3,
            title: "Medieval Persian Script",
            // location: "Delhi",
            // period: "13th Century",
            image: img3,
            description: "The Qutb Complex in Delhi features significant Sultanate-period inscriptions (12th-14th centuries) in Arabic and Naskh scripts, primarily adorning the Qutub Minar, Quwwat-ul-Islam Mosque, and Alai Darwaza",
            link: "/feed/68c7a95062ee5a8274fceaae"
            // likes: 156,
            // views: 743,
            // comments: 28
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredInscriptions.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h3 className="text-3xl text-secondary-dark font-bold mb-4">Featured Discoveries</h3>
                    <p className="text-secondary-dark text-lg">Explore remarkable inscriptions recently added to our collection</p>
                </div>

                <div className="relative">
                    <div className="overflow-hidden rounded-2xl">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {featuredInscriptions.map((inscription) => (
                                <div key={inscription.id} className="w-full flex-shrink-0">
                                    <div className="grid md:grid-cols-2 gap-8 card-styling backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 ">
                                        <div className="relative group">
                                            <img
                                                src={inscription.image}
                                                alt={inscription.title}
                                                className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute card-styling-lightinset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-2xl font-bold mb-3 primary-text-dark">{inscription.title}</h4>
                                            {/* <div className="flex items-center text-slate-400 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            {inscription.location}
                            </div>
                            <div className="flex items-center text-slate-400 mb-4">
                            <Calendar className="w-4 h-4 mr-2" />
                            {inscription.period}
                            </div> */}
                                            <p className="primary-text-dark mb-6 leading-relaxed">{inscription.description}</p>

                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex space-x-6 text-sm text-slate-400">
                                                    {/* <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {inscription.likes}
                                </span>
                                <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {inscription.views}
                                </span>
                                <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {inscription.comments}
                                </span> */}
                                                </div>
                                            </div>

                                            {/* <NavLink to={inscription.link} className="bg-gradient-to-r text-primary-text bg-primary px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center text-stroke">
                                                Explore Details
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </NavLink> */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {featuredInscriptions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-primary' : 'bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeaturedInscriptionsCarousel;