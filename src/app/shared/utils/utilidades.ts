export type generalObject = {[keys:string]:any}
export function arrayToObject(array:Array<string>):generalObject{
    return array.reduce((a,v)=>({...a,[v]:v}),{})
}

export function GET_FILE_CATEGORY_TYPE(fileExtension: string): string {
    if (fileExtension.includes('image')) {
      return 'image';
    } else if (fileExtension.includes('video')) {
      return 'video';
    } else {
      return 'other';
    }
  }
  
  export function GET_FILE_TYPE(name: string):string {
    return name.split('.').pop()!.toUpperCase();
  }
  
  export function IS_IMAGE_FILE(fileType: string | undefined | any): boolean  {
    const IMAGE_TYPES = ['PNG', 'JPG', 'JPEG', 'BMP', 'WEBP', 'JFIF', 'TIFF'];
    return (IMAGE_TYPES as any).includes(fileType.toUpperCase());
  }

  export const DEFAULT_CROPPER_OPTIONS = {
    dragMode: 'crop',
    aspectRatio: 1,
    autoCrop: true,
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 0.8
};

export function bitsToMB(size: number): number {
   return parseFloat(size.toString()) / 1048576;
}