import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
@Injectable()
export class SupabaseGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
     console.log('Guard running');
     return super.canActivate(context);
   }
}
