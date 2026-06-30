import placeholderImage1 from '@/assets/placeholder.svg';
import placeholderImage2 from '@/assets/parallaxImages/banner2.jpg';
import placeholderImage3 from '@/assets/parallaxImages/banner3.jpg';
import placeholderImage4 from '@/assets/parallaxImages/banner4.png';

export interface Comment {
    id?: string;
    _id: string;
    postId: string;
    userId: string;
    username: string;
    userImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    upvote: number;
    userVote: string[];
}

interface UserRating {
    userId: string;
    rating: number;
}

interface Post {
    _id: string;
    user_id: string;
    user_name: string;
    createdAt: Date;
    images: {
        thumbnailImage: string[];
        image: string[];
    };
    description: {
        title: string;
        description: string;
        scriptLanguage: string[];
        language: string[];
        englishTranslation: string;
        upvote: number;
        geolocation?: {
            lon: number;
            lat?: number;
            state?: string;
            city?: string;
            region?: string;
        };
        createdAt: Date;
        updatedAt: Date;
    };
    userrating?: UserRating[];
    topic: string;
    script: string[];
    type: string;
    rating: number;
}

// Add fallback dummy data for styling purposes
export const dummyPost: Post = {
    _id: "dummy-id",
    user_id: "dummy-user",
    user_name: "John Doe",
    createdAt: new Date(),
    images: {
        thumbnailImage: [placeholderImage1],
        image: [placeholderImage1],
    },
    description: {
        title: "dummy Inscription Title",
        description: "this is a dummy description for styling purposes.",
        scriptLanguage: ["dummy Script", "another Script"],
        language: ["dummy Language", "another Language"],
        englishTranslation: "this is a dummy translation.",
        upvote: 0,
        geolocation: {
            lon: 0,
            lat: 0,
            state: "dummy State",
            city: "dummy City",
            region: "dummy Region",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    userrating: [],
    topic: "dummy Topicsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
    script: ["dummy Script", "another Script"],
    type: "dummy Type111111111111111111111111111111111111111",
    rating: 3.3,
};

const FALLBACK_POST_IDS = [
    "69118753d23e86bbb9cb8ce7",
    "69118ba3d23e86bbb9cb8ce9",
    "6913054f05959ad242fe9751",
    "69130e4d05959ad242fe9756",
    "69130efa05959ad242fe9758",
    "69131eeb05959ad242fe975e",
    "6913215f05959ad242fe9762",
    "6913219a05959ad242fe9764",
    "691481c31320a08c6c576ca4",
    "6915792a1320a08c6c576ca8",
];

type CommentSeed = {
    username: string;
    userId: string;
    userImageUrl: string;
    description: string;
    upvote: number;
    userVote: string[];
};

const COMMENT_SEEDS: CommentSeed[] = [
    {
        username: "Ambika Choudhary",
        userId: "user123",
        userImageUrl: placeholderImage1,
        description:
            "The script appears to be an early Kannada inscription.",
        upvote: 4,
        userVote: [],
    },
    {
        username: "Ambika Choudhary",
        userId: "user123",
        userImageUrl: placeholderImage1,
        description:
            "The damaged section may contain a royal title.",
        upvote: 7,
        userVote: [],
    },
    {
        username: "Ambika Choudhary",
        userId: "user123",
        userImageUrl: placeholderImage1,
        description:
            "This inscription should be compared with nearby Chola records.",
        upvote: 3,
        userVote: [],
    },
    {
        username: "Aditi Rao",
        userId: "dummy-user-01",
        userImageUrl: placeholderImage1,
        description: "The script style here looks early-medieval to me.",
        upvote: 6,
        userVote: ["dummy-user", "dummy-user-08"],
    },
    {
        username: "Rahul Menon",
        userId: "dummy-user-02",
        userImageUrl: placeholderImage2,
        description: "Great image quality. The edge marks are clearly visible.",
        upvote: 2,
        userVote: [],
    },
    {
        username: "Meera Iyer",
        userId: "dummy-user-03",
        userImageUrl: placeholderImage3,
        description: "Could this be a commemorative inscription instead of a land grant?",
        upvote: 4,
        userVote: ["dummy-user-05"],
    },
    {
        username: "Karan Das",
        userId: "dummy-user-04",
        userImageUrl: placeholderImage4,
        description: "The weathering pattern suggests this was exposed for a long period.",
        upvote: 1,
        userVote: [],
    },
    {
        username: "Nisha Patel",
        userId: "dummy-user-05",
        userImageUrl: placeholderImage1,
        description: "I think the middle line could use a cleaner transliteration.",
        upvote: 3,
        userVote: ["dummy-user-11"],
    },
    {
        username: "Vikram Singh",
        userId: "dummy-user-06",
        userImageUrl: placeholderImage2,
        description: "Location metadata is useful; maybe add nearby site references too.",
        upvote: 5,
        userVote: ["dummy-user", "dummy-user-03", "dummy-user-04"],
    },
    {
        username: "Anita Joseph",
        userId: "dummy-user-07",
        userImageUrl: placeholderImage3,
        description: "The heading looks formulaic, similar to other temple records.",
        upvote: 2,
        userVote: [],
    },
    {
        username: "Suresh Kumar",
        userId: "dummy-user-08",
        userImageUrl: placeholderImage4,
        description: "This one probably deserves a higher confidence score.",
        upvote: 7,
        userVote: ["dummy-user-01", "dummy-user-02"],
    },
    {
        username: "Pooja Nair",
        userId: "dummy-user-09",
        userImageUrl: placeholderImage1,
        description: "I edited a similar inscription and this matches that pattern.",
        upvote: 0,
        userVote: [],
    },
    {
        username: "Arun Bhat",
        userId: "dummy-user-10",
        userImageUrl: placeholderImage2,
        description: "The right margin might include missing characters.",
        upvote: 3,
        userVote: ["dummy-user-12"],
    },
    {
        username: "Deepa Sharma",
        userId: "dummy-user-11",
        userImageUrl: placeholderImage3,
        description: "Can we attach an alternate interpretation in a second comment?",
        upvote: 1,
        userVote: [],
    },
    {
        username: "Manoj R",
        userId: "dummy-user-12",
        userImageUrl: placeholderImage4,
        description: "Good baseline data for testing like and edit flows.",
        upvote: 8,
        userVote: ["dummy-user", "dummy-user-06", "dummy-user-09"],
    },
];

const createDummyComment = (
    postId: string,
    seed: CommentSeed,
    index: number
): Comment => {

    const hoursAgo = index * 3;
    const createdAt = new Date(
        Date.now() - hoursAgo * 60 * 60 * 1000
    );

    return {
        id: `dummy-comment-${postId}-${index + 1}`,
        _id: `dummy-comment-${postId}-${index + 1}`,
        postId,

        userId: seed.userId,
        username: seed.username,
        description: seed.description,

        upvote: seed.upvote,
        userVote: seed.userVote,

        userImageUrl: seed.userImageUrl,

        createdAt,
        updatedAt: createdAt,
    };
};
export const dummyCommentsByPostId: Record<string, Comment[]> = FALLBACK_POST_IDS.reduce((acc, postId, postIndex) => {
    const baseIndex = postIndex * 2;
    const postComments = Array.from({ length: 4 }, (_, offset) => {
        const seed = COMMENT_SEEDS[(baseIndex + offset) % COMMENT_SEEDS.length];
        return createDummyComment(postId, seed, offset);
    });

    acc[postId] = postComments;
    return acc;
}, {} as Record<string, Comment[]>);

// Flattened list kept for backward compatibility where a plain array is expected.
export const dummyComments: Comment[] = Object.values(dummyCommentsByPostId).flat();

export const getDummyCommentsByPostId = (postId?: string): Comment[] => {
    if (!postId) {
        return dummyCommentsByPostId[FALLBACK_POST_IDS[0]] ?? [];
    }

    return dummyCommentsByPostId[postId] ?? [];
};

export const mockDiscoveryPosts = {
    "data": [
        {
            "_id": "69118753d23e86bbb9cb8ce7",
            "user_id": "69118409d23e86bbb9cb8ce4",
            "createdAt": "2025-11-10T06:33:55.615+00:00",
            "updatedAt": "2025-11-13T06:49:44.251+00:00",
            "images": {
                "thumbnailImage": "https://upload.wikimedia.org/wikipedia/en/e/ed/Umachal_Rock_Inscription.png",
                "image": [
                    "https://upload.wikimedia.org/wikipedia/en/e/ed/Umachal_Rock_Inscription.png"
                ]
            },
            "description": {
                "title": "Rock inscription 1",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-10T06:33:55.615+00:00",
                "updatedAt": "2025-11-13T06:49:44.251+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 4.666666666666667,
            "userrating": [
                {
                    "userId": "69118409d23e86bbb9cb8ce4",
                    "rating": 5.0
                },
                {
                    "userId": "6911cdfe05959ad242fe974e",
                    "rating": 4.0
                },
                {
                    "userId": "6913147305959ad242fe975b",
                    "rating": 5.0
                }
            ]
        },
        {
            "_id": "69118ba3d23e86bbb9cb8ce9",
            "user_id": "69118409d23e86bbb9cb8ce4",
            "createdAt": "2025-11-10T06:52:19.819+00:00",
            "updatedAt": "2025-11-11T05:29:16.637+00:00",
            "images": {
                "thumbnailImage": "https://www.worldhistory.org/uploads/images/19292.png?v=1722463500-1722941054",
                "image": [
                    "https://www.worldhistory.org/uploads/images/19292.png?v=1722463500-1722941054"
                ]
            },
            "description": {
                "title": "Rock Inscription 31",
                "subject": null,
                "description": "test",
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-10T06:52:19.819+00:00",
                "updatedAt": "2025-11-11T05:29:16.637+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 4.0,
            "userrating": [
                {
                    "userId": "69118409d23e86bbb9cb8ce4",
                    "rating": 5.0
                },
                {
                    "userId": "6911cdfe05959ad242fe974e",
                    "rating": 3.0
                }
            ]
        },
        {
            "_id": "6913054f05959ad242fe9751",
            "user_id": "69118409d23e86bbb9cb8ce4",
            "username": "testuser123",
            "createdAt": "2025-11-11T09:43:43.041+00:00",
            "updatedAt": "2025-11-11T09:43:46.201+00:00",
            "images": {
                "thumbnailImage": "https://www.shutterstock.com/shutterstock/photos/1927668710/display_1500/stock-photo-inscriptions-of-tamil-language-carved-on-the-stone-walls-at-brihadeeswarar-temple-in-thanjavur-1927668710.jpg",
                "image": [
                    "https://www.shutterstock.com/shutterstock/photos/1927668710/display_1500/stock-photo-inscriptions-of-tamil-language-carved-on-the-stone-walls-at-brihadeeswarar-temple-in-thanjavur-1927668710.jpg",
                    "https://inscriptions.cdacb.in/api/post/public/images/6913055005959ad242fe9753",
                    "https://inscriptions.cdacb.in/api/post/public/images/6913055005959ad242fe9754"
                ]
            },
            "description": {
                "title": "First",
                "subject": "First",
                "description": "Dooravaninagar and Ramamurthy Nagar are prominent localities situated within the eastern part of Bengaluru (Bangalore), the capital city of Karnataka, India. These areas fall under the jurisdiction of the Bengaluru East City Corporation, part of the broader Bengaluru Urban district. The postal code for this region is 560016, identifying it within the extensive postal network of the country.",
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-11T09:43:43.041+00:00",
                "updatedAt": "2025-11-11T09:43:46.201+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "visibility": true,
            "distance": null,
            "rating": 0.0,
            "userrating": [],
            "postedAnonymously": true
        },
        {
            "_id": "69130e4d05959ad242fe9756",
            "user_id": "69118409d23e86bbb9cb8ce4",
            "createdAt": "2025-11-11T10:22:05.028+00:00",
            "updatedAt": "2025-11-11T10:22:05.458+00:00",
            "images": {
                "thumbnailImage": "https://c7.alamy.com/comp/PKHCTG/rock-inscriptions-leh-ladakh-jammu-kashmir-india-asia-PKHCTG.jpg",
                "image": [
                    "https://c7.alamy.com/comp/PKHCTG/rock-inscriptions-leh-ladakh-jammu-kashmir-india-asia-PKHCTG.jpg"
                ]
            },
            "description": {
                "title": "forth",
                "subject": "v",
                "description": "Dooravaninagar is a locality situated within Ramamurthy Nagar, an area located in the eastern part of Bengaluru. It falls under the administrative jurisdiction of the Bengaluru East City Corporation, within Bengaluru (also known as Bangalore East) in the Bengaluru Urban district of Karnataka, India. The postal code for this area is 560016.",
                "scriptLanguage": null,
                "language": [
                    "san"
                ],
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-11T10:22:05.028+00:00",
                "updatedAt": "2025-11-11T10:22:05.458+00:00"
            },
            "topic": "tamil",
            "script": [
                "tamill"
            ],
            "type": "Tamil",
            "distance": null,
            "rating": 0.0,
            "userrating": []
        },
        {
            "_id": "69130efa05959ad242fe9758",
            "user_id": "69118409d23e86bbb9cb8ce4",
            "createdAt": "2025-11-11T10:24:58.077+00:00",
            "updatedAt": "2025-11-11T10:24:59.041+00:00",
            "images": {
                "thumbnailImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsR6TqN0wXAwyh3V1gTduxeQixmVoxlLn4BQ&s",
                "image": [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsR6TqN0wXAwyh3V1gTduxeQixmVoxlLn4BQ&s"
                ]
            },
            "description": {
                "title": "Chola inscription",
                "subject": null,
                "description": "Dooravaninagar and Ramamurthy Nagar are well-known localities situated within the Bengaluru East City Corporation administrative zone in the eastern part of Bengaluru (Bangalore), Karnataka, India. These areas fall under the Bengaluru Urban district and are identified by the postal code 560016, indicating their specific geographical location within the city's extensive network.",
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-11T10:24:58.077+00:00",
                "updatedAt": "2025-11-11T10:24:59.041+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 0.0,
            "userrating": []
        },
        {
            "_id": "69131eeb05959ad242fe975e",
            "user_id": "69131e0505959ad242fe975d",
            "createdAt": "2025-11-11T11:32:59.174+00:00",
            "updatedAt": "2025-11-11T11:32:59.502+00:00",
            "images": {
                "thumbnailImage": "https://whc.unesco.org/uploads/thumbs/site_1222_0002-500--20110920204336.jpg",
                "image": [
                    "https://whc.unesco.org/uploads/thumbs/site_1222_0002-500--20110920204336.jpg"
                ]
            },
            "description": {
                "title": "Persian",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": {
                    "amenity": "",
                    "road": "Swamy Vivekananda Road",
                    "neighbourhood": "Benniganahalli",
                    "suburb": "Baiyyappanahalli",
                    "city": "Bengaluru",
                    "county": "Bangalore East",
                    "state": "Karnataka",
                    "postcode": "560033",
                    "country": "India",
                    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
                    "type": "parking",
                    "importance": 7.094453345536E-5,
                    "name": "",
                    "boundingbox": [
                        "12.9896251",
                        "12.9903375",
                        "77.6525387",
                        "77.6538333"
                    ],
                    "coordinates": null,
                    "lon": "77.65240277777778",
                    "lat": "12.989738888888889",
                    "city_district": "Bengaluru Central City Corporation",
                    "state_district": "Bengaluru Urban",
                    "ISO3166-2-lvl4": "IN-KA",
                    "country_code": "in",
                    "place_id": 233528628,
                    "osm_type": "way",
                    "osm_id": 148042611,
                    "class": "amenity",
                    "place_rank": 30,
                    "addresstype": "amenity",
                    "display_name": "Swamy Vivekananda Road, Benniganahalli, Baiyyappanahalli, Bengaluru Central City Corporation, Bengaluru, Bangalore East, Bengaluru Urban, Karnataka, 560033, India"
                },
                "createdAt": "2025-11-11T11:32:59.174+00:00",
                "updatedAt": "2025-11-11T11:32:59.502+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 0.0,
            "userrating": []
        },
        {
            "_id": "6913215f05959ad242fe9762",
            "user_id": "691320ae05959ad242fe9761",
            "createdAt": "2025-11-11T11:43:27.281+00:00",
            "updatedAt": "2025-11-11T11:43:27.467+00:00",
            "images": {
                "thumbnailImage": "https://media.istockphoto.com/id/1086350072/photo/old-inscription-on-a-ancient-temple.jpg?s=1024x1024&w=is&k=20&c=E-JUcPT667yZs2sj5RuOlEP47BtyeovCPcL9_Nf85Fw=",
                "image": [
                    "https://media.istockphoto.com/id/1086350072/photo/old-inscription-on-a-ancient-temple.jpg?s=1024x1024&w=is&k=20&c=E-JUcPT667yZs2sj5RuOlEP47BtyeovCPcL9_Nf85Fw=",
                    "https://c7.alamy.com/comp/FFYG90/carved-inscriptions-on-side-wall-of-hajara-rama-temple-depicting-hampi-FFYG90.jpg",
                    "http://digitalhampi.in/gkdemo/Data/Images/VirupakshaInscription1.jpg"
                ]
            },
            "description": {
                "title": "Hampi inscription",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": {
                    "amenity": "",
                    "road": "Swamy Vivekananda Road",
                    "neighbourhood": "Benniganahalli",
                    "suburb": "Baiyyappanahalli",
                    "city": "Bengaluru",
                    "county": "Bangalore East",
                    "state": "Karnataka",
                    "postcode": "560033",
                    "country": "India",
                    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
                    "type": "parking",
                    "importance": 7.094453345536E-5,
                    "name": "",
                    "boundingbox": [
                        "12.9896251",
                        "12.9903375",
                        "77.6525387",
                        "77.6538333"
                    ],
                    "coordinates": null,
                    "lon": "77.6524388888889",
                    "lat": "12.989819444444443",
                    "city_district": "Bengaluru Central City Corporation",
                    "state_district": "Bengaluru Urban",
                    "ISO3166-2-lvl4": "IN-KA",
                    "country_code": "in",
                    "place_id": 232325775,
                    "osm_type": "way",
                    "osm_id": 148042611,
                    "class": "amenity",
                    "place_rank": 30,
                    "addresstype": "amenity",
                    "display_name": "Swamy Vivekananda Road, Benniganahalli, Baiyyappanahalli, Bengaluru Central City Corporation, Bengaluru, Bangalore East, Bengaluru Urban, Karnataka, 560033, India"
                },
                "createdAt": "2025-11-11T11:43:27.281+00:00",
                "updatedAt": "2025-11-11T11:43:27.467+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 0.0,
            "userrating": []
        },
        {
            "_id": "6913219a05959ad242fe9764",
            "user_id": "691320ae05959ad242fe9761",
            "createdAt": "2025-11-11T11:44:26.365+00:00",
            "updatedAt": "2025-11-11T11:44:27.012+00:00",
            "images": {
                "thumbnailImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Inscription_of_Hammurabi_King_of_Babylon.jpg/1280px-Inscription_of_Hammurabi_King_of_Babylon.jpg?20190403112554",
                "image": [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Inscription_of_Hammurabi_King_of_Babylon.jpg/1280px-Inscription_of_Hammurabi_King_of_Babylon.jpg?20190403112554"
                ]
            },
            "description": {
                "title": "Babylon inscription",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": {
                    "amenity": "",
                    "road": "Swamy Vivekananda Road",
                    "neighbourhood": "Benniganahalli",
                    "suburb": "Baiyyappanahalli",
                    "city": "Bengaluru",
                    "county": "Bangalore East",
                    "state": "Karnataka",
                    "postcode": "560033",
                    "country": "India",
                    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
                    "type": "parking",
                    "importance": 7.094453345536E-5,
                    "name": "",
                    "boundingbox": [
                        "12.9896251",
                        "12.9903375",
                        "77.6525387",
                        "77.6538333"
                    ],
                    "coordinates": null,
                    "lon": "77.6524388888889",
                    "lat": "12.989819444444443",
                    "city_district": "Bengaluru Central City Corporation",
                    "state_district": "Bengaluru Urban",
                    "ISO3166-2-lvl4": "IN-KA",
                    "country_code": "in",
                    "place_id": 232325775,
                    "osm_type": "way",
                    "osm_id": 148042611,
                    "class": "amenity",
                    "place_rank": 30,
                    "addresstype": "amenity",
                    "display_name": "Swamy Vivekananda Road, Benniganahalli, Baiyyappanahalli, Bengaluru Central City Corporation, Bengaluru, Bangalore East, Bengaluru Urban, Karnataka, 560033, India"
                },
                "createdAt": "2025-11-11T11:44:26.365+00:00",
                "updatedAt": "2025-11-11T11:44:27.012+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 0.0,
            "userrating": []
        },
        {
            "_id": "691481c31320a08c6c576ca4",
            "user_id": "6911806ed23e86bbb9cb8ce2",
            "createdAt": "2025-11-12T12:46:59.980+00:00",
            "updatedAt": "2025-11-13T06:52:04.478+00:00",
            "images": {
                "thumbnailImage": "https://s7g10.scene7.com/is/image/rcu/rock-art-inscriptions-blog-full-03?$Responsive$&fit=stretch&fmt=webp&wid=1920",
                "image": [
                    "https://s7g10.scene7.com/is/image/rcu/rock-art-inscriptions-blog-full-03?$Responsive$&fit=stretch&fmt=webp&wid=1920"
                ]
            },
            "description": {
                "title": "\"><script>alert('Hello!')</script>",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": {
                    "amenity": "Spastics Society of Karnataka",
                    "road": "100 Feet Road",
                    "neighbourhood": "Old Binnamangala",
                    "suburb": "Indiranagar",
                    "city": "Bengaluru Central City Corporation",
                    "county": "Bangalore North",
                    "state": "Karnataka",
                    "postcode": "560038",
                    "country": "India",
                    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
                    "type": "school",
                    "importance": 7.094453345536E-5,
                    "name": "Spastics Society of Karnataka",
                    "boundingbox": [
                        "12.9803510",
                        "12.9813762",
                        "77.6414222",
                        "77.6438739"
                    ],
                    "coordinates": null,
                    "lon": "77.64214722222223",
                    "lat": "12.980788888888888",
                    "city_district": "",
                    "state_district": "Bengaluru Urban",
                    "ISO3166-2-lvl4": "IN-KA",
                    "country_code": "in",
                    "place_id": 233142614,
                    "osm_type": "way",
                    "osm_id": 41499025,
                    "class": "amenity",
                    "place_rank": 30,
                    "addresstype": "amenity",
                    "display_name": "Spastics Society of Karnataka, 100 Feet Road, Old Binnamangala, Indiranagar, Bengaluru Central City Corporation, Bangalore North, Bengaluru Urban, Karnataka, 560038, India"
                },
                "createdAt": "2025-11-12T12:46:59.980+00:00",
                "updatedAt": "2025-11-13T06:52:04.478+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 5.0,
            "userrating": [
                {
                    "userId": "6913147305959ad242fe975b",
                    "rating": 5.0
                }
            ]
        },
        {
            "_id": "6915792a1320a08c6c576ca8",
            "user_id": "6913147305959ad242fe975b",
            "createdAt": "2025-11-13T06:22:34.197+00:00",
            "updatedAt": "2025-11-17T06:32:47.730+00:00",
            "images": {
                "thumbnailImage": "https://mapacademy.io/wp-content/uploads/2022/09/ashoka-edicts-2m.jpg",
                "image": [
                    "https://mapacademy.io/wp-content/uploads/2022/09/ashoka-edicts-2m.jpg"
                ]
            },
            "description": {
                "title": "Mauryan inscription",
                "subject": null,
                "description": null,
                "scriptLanguage": null,
                "language": null,
                "englishTranslation": null,
                "upvote": 0,
                "geolocation": null,
                "createdAt": "2025-11-13T06:22:34.197+00:00",
                "updatedAt": "2025-11-17T06:32:47.730+00:00"
            },
            "topic": "",
            "script": [],
            "type": "Stone",
            "distance": null,
            "rating": 5.0,
            "userrating": [
                {
                    "userId": "69118409d23e86bbb9cb8ce4",
                    "rating": 5.0
                }
            ]
        }
    ],
    "http-status": "OK",
    "message": "All Posts"
}
