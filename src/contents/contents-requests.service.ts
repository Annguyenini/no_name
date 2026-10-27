import { Injectable } from "@nestjs/common"

interface UploadRequest{
  user_id: string,
  key: string,
  content_type: string
  expire_at:number
}
@Injectable()
export class UploadRequests{
  private upload_map = new Map<string,UploadRequest>()

  addObjectIntoMap(key: string, object: UploadRequest) {
    return this.upload_map.set(key, object)
  }
  getObjectFromMap(key: string) {
    return this.upload_map.get(key)
  }
  deleteObjectFromMap(key: string) {
    return this.upload_map.delete(key)
  }
}
