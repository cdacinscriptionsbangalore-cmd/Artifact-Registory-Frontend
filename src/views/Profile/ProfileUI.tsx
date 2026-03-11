// components/profile/ProfileUI.tsx

import React from "react";
import ProfileHeader from "./ProfileHeader";
import StatsGrid from "./StatsGrid";
import StatsGrid1 from "./StatsGrid1";
import ImageGallery from "./ImageGallery1";
import ContributionsList from "./ContributionsList1";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { Images, MessageCircle } from "lucide-react";

interface ProfileUIProps {
  user: any;
  posts: any[];
  comments: any[];
}


// TAB PANEL COMPONENT
function CustomTabPanel(props: any) {

  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}



const ProfileUI = ({ user, posts, comments }: ProfileUIProps) => {

  // USE ONLY ONE STATE
  const [tabValue, setTabValue] = React.useState(0);


  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabValue(newValue);
  };


  return (

    <div className="min-h-screen bg-primary-background p-4">

      <div className="max-w-6xl mx-auto">


        {user && <ProfileHeader user={user} />}


        {user && (
          <>
            <div className="profile-stats-pc">
              <StatsGrid1 stats={user} />
            </div>

            <div className="profile-stats-mob">
              <StatsGrid stats={user} />
            </div>
          </>
        )}



        <h2 className="text-xl font-bold text-black my-6">
          My Contributions
        </h2>



        <Box sx={{ bgcolor: "background.paper", width: "100%", marginTop: 2, borderRadius: 1, boxShadow: 1 }}>


          {/* TAB HEADERS */}
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            variant="fullWidth"
            sx={{ border: "2px solid #e5e7eb" }}
          >

            <Tab
              icon={<Images className="h-5" />}
              label="My Posts"
            />

            <Tab
              icon={<MessageCircle className="h-5" />}
              label="My Comments"
              sx={{ borderLeft: "2px solid #e5e7eb" }}
            />
            <Tab
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-search-corner-icon lucide-file-search-corner"><path d="M11.1 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.589 3.588A2.4 2.4 0 0 1 20 8v3.25" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="m21 22-2.88-2.88" /><circle cx="16" cy="17" r="3" /></svg>}
              label="Under Review Posts"
              sx={{ borderLeft: "2px solid #e5e7eb" }}
            />

          </Tabs>



          {/* POSTS TAB */}
          <CustomTabPanel value={tabValue} index={0} >

            {posts?.length > 0 ? (
              <ImageGallery posts={posts} />
            ) : (
              <div className="py-8 flex items-center justify-center min-h-80">
                No posts available.
              </div>
            )}

          </CustomTabPanel>



          {/* COMMENTS TAB */}
          <CustomTabPanel value={tabValue} index={1} className="p-4 sm:p-4 md:p-4 borderRed">

            {comments?.length > 0 ? (
              <ContributionsList comments={comments} />
            ) : (
              <div className="py-8 flex items-center justify-center min-h-80">
                No comments available.
              </div>
            )}

          </CustomTabPanel>
          {/* COMMENTS TAB */}
          <CustomTabPanel value={tabValue} index={2} className="p-4 sm:p-4 md:p-4 borderRed">

            {comments?.length > 0 ? (
              <ContributionsList comments={comments} />
            ) : (
              <div className="py-8 flex items-center justify-center min-h-80">
                No posts under review.
              </div>
            )}

          </CustomTabPanel>



        </Box>


      </div>

    </div>

  );
};


export default ProfileUI;