import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import {
  GST_STATES_BY_CODE,
  GstTreatment,
  PLACE_OF_SUPPLY_OUTSIDE_INDIA,
  normalizeGstin,
  validateGstin,
} from '@bigcapital/utils';
import { IsOptional } from '@/common/decorators/Validators';
import { ContactAddressDto } from '@/modules/Customers/dtos/ContactAddress.dto';

/** Validates a GSTIN: format, state code and check character. */
export function IsGstin(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGstin',
      target: object.constructor,
      propertyName,
      options: {
        message: 'GSTIN is invalid (check the format and the last character).',
        ...validationOptions,
      },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && validateGstin(value).valid,
      },
    });
  };
}

const PLACE_OF_SUPPLY_CODES = [
  ...Array.from(GST_STATES_BY_CODE.keys()),
  PLACE_OF_SUPPLY_OUTSIDE_INDIA,
];

// Missing fields stay undefined (left unchanged on edit); empty strings clear.
const emptyToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

/**
 * GST fields shared by customer and vendor create/edit requests.
 */
export class ContactGstFieldsDto extends ContactAddressDto {
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'GSTIN of the contact (15 characters)',
    example: '27AAPFU0939F1ZV',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim() === '' ? null : normalizeGstin(value);
  })
  @IsString()
  @IsGstin()
  gstin?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'GST registration type of the contact',
    enum: Object.values(GstTreatment),
  })
  @IsOptional()
  @Transform(emptyToNull)
  @IsIn(Object.values(GstTreatment))
  gstTreatment?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      "Default place of supply: 2-digit GST state code, or '96' for outside India",
    example: '27',
  })
  @IsOptional()
  @Transform(emptyToNull)
  @IsIn(PLACE_OF_SUPPLY_CODES)
  placeOfSupply?: string | null;
}
