export const extractFramesFromVideo = (
  videoFile: File, 
  numFrames: number,
  onProgress: (progress: number) => void
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    const objectUrl = URL.createObjectURL(videoFile);

    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return reject(new Error('Canvas context is not available.'));
    }

    video.src = objectUrl;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      if (duration === 0) {
         URL.revokeObjectURL(objectUrl);
         return reject(new Error("Video has no duration. It might be an invalid file."));
      }
      
      const MAX_DURATION = 300; // 5 minutes in seconds
      const startTime = duration > MAX_DURATION ? duration - MAX_DURATION : 0;
      const effectiveDuration = duration - startTime;
      
      const interval = effectiveDuration / numFrames;
      let currentTime = startTime + interval / 2; // Start from middle of first segment of the relevant part
      let framesExtracted = 0;

      const captureFrame = () => {
        if (framesExtracted >= numFrames) {
          onProgress(1); // Ensure it completes at 100%
          URL.revokeObjectURL(objectUrl);
          video.remove();
          canvas.remove();
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        if (base64) {
          frames.push(base64);
        }
        framesExtracted++;
        onProgress(framesExtracted / numFrames);
        currentTime += interval;
        captureFrame();
      };
      
      video.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
        canvas.remove();
        reject(new Error('Error loading video file. It may be corrupt or an unsupported format.'));
      };
      
      onProgress(0);
      captureFrame();
    };

    video.load();
  });
};