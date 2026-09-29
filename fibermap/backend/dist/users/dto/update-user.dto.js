import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
}
//# sourceMappingURL=update-user.dto.js.map