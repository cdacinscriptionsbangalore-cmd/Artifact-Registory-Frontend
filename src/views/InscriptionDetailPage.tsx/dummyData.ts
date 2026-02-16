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

// Add fallback dummy comments for styling purposes
export const dummyComments: Comment[] = [
    {
        _id: "dummy-comment-1",
        postId: "dummy-id",
        userId: "dummy-user-1",
        username: "Jane Doe",
        userImageUrl: placeholderImage1,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "This is a dummy comment for styling purposes.",
        upvote: 5,
        userVote: [],
    },
    {
        _id: "dummy-comment-2",
        postId: "dummy-id",
        userId: "dummy-user-2",
        username: "John Smith",
        userImageUrl: placeholderImage2,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Another dummy comment to test the layout.",
        upvote: 3,
        userVote: [],
    },
    {
        _id: "dummy-comment-3",
        postId: "dummy-id",
        userId: "dummy-user-3",
        username: "Alice Johnson",
        userImageUrl: placeholderImage3,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 2,
        userVote: [],
    }
    , {
        _id: "dummy-comment-4",
        postId: "dummy-id",
        userId: "dummy-user-4",
        username: "Bob Brown",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 1,
        userVote: [],
    }, {
        _id: "dummy-comment-5",
        postId: "dummy-id",
        userId: "dummy-user-5",
        username: "Charlie Davis",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    , {
        _id: "dummy-comment-6",
        postId: "dummy-id",
        userId: "dummy-user-6",
        username: "Eve White",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-7",
        postId: "dummy-id",
        userId: "dummy-user-7",
        username: "Frank Green",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-8",
        postId: "dummy-id",
        userId: "dummy-user-8",
        username: "Grace Hopper",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-9",
        postId: "dummy-id",
        userId: "dummy-user-9",
        username: "Manny Quinn",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-10",
        postId: "dummy-id",
        userId: "dummy-user-10",
        username: "Lee Keybumm",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-11",
        postId: "dummy-id",
        userId: "dummy-user-11",
        username: "Hugh Janice",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-12",
        postId: "dummy-id",
        userId: "dummy-user-12",
        username: "Mike Litoris",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-13",
        postId: "dummy-id",
        userId: "dummy-user-13",
        username: "Juggs McBulge",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    },
    {
        _id: "dummy-comment-14",
        postId: "dummy-id",
        userId: "dummy-user-14",
        username: "Doctor Acula",
        userImageUrl: placeholderImage4,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Yet another dummy comment for testing.",
        upvote: 0,
        userVote: [],
    }
];
