export const getPublicIdFromUrl = (url) => {
    if(!url){ return null}
    try {
        const part = url.split("/upload/");
        let publicIdWithVersion = part[1];
        //remove version and extension 
        const publicId = publicIdWithVersion.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
        return publicId;
    } catch (error) {
        return null
    }
}