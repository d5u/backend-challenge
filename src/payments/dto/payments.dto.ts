import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChargeDonationDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsNumber()
  @IsNotEmpty()
  expMonth: number;

  @IsNumber()
  @IsNotEmpty()
  expYear: number;

  @IsString()
  @IsNotEmpty()
  cvc: string;
}
