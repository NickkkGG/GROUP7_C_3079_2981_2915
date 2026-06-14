const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9]{8,13}$/;
// Total digit Indonesia: 10-13 (prefix 08/62/+62 + 8-13 digit)
const PHONE_DIGIT_MIN = 10;
const PHONE_DIGIT_MAX = 13;
const VERIFICATION_CODE_REGEX = /^[A-Z0-9]{6}$/;

export const SHIPMENT_SERVICE_TYPES = ['Regular', 'Express', 'Priority'] as const;
export const SHIPMENT_STATUSES = ['booked', 'received', 'in_transit', 'arrived', 'delivered'] as const;

type ShipmentServiceType = typeof SHIPMENT_SERVICE_TYPES[number];
type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

const normalizeString = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const normalizeOptionalString = (value: unknown) => {
  const normalized = normalizeString(value);
  return normalized || null;
};

export function isValidPhone(value: string) {
  const normalized = value.replace(/[\s-]/g, '');
  if (!PHONE_REGEX.test(normalized)) return false;
  const digits = normalized.replace(/^\+/, '');
  return digits.length >= PHONE_DIGIT_MIN && digits.length <= PHONE_DIGIT_MAX;
}

export function validateRegisterStepOne(input: {
  fullName: unknown;
  email: unknown;
  password: unknown;
  code?: unknown;
}) {
  const fullName = normalizeString(input.fullName);
  const email = normalizeString(input.email).toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';
  const code = input.code === undefined ? undefined : normalizeString(input.code).toUpperCase();

  if (!fullName) return { ok: false as const, error: 'ALTUS Register Error: Full name cannot be empty' };
  if (fullName.length < 3) return { ok: false as const, error: 'ALTUS Register Error: Full name must be at least 3 characters' };
  if (!email) return { ok: false as const, error: 'ALTUS Register Error: Email cannot be empty' };
  if (!EMAIL_REGEX.test(email)) return { ok: false as const, error: 'ALTUS Register Error: Invalid email format. Use format: name@domain.com' };
  if (!password) return { ok: false as const, error: 'ALTUS Register Error: Password cannot be empty' };
  if (password.length < 6) return { ok: false as const, error: 'ALTUS Register Error: Password must be at least 6 characters' };
  if (code !== undefined) {
    if (!code) return { ok: false as const, error: 'ALTUS Register Error: Failed to generate verification code. Please try again.' };
    if (!VERIFICATION_CODE_REGEX.test(code)) return { ok: false as const, error: 'ALTUS Register Error: Verification code must be 6 uppercase letters or numbers' };
  }

  return {
    ok: true as const,
    sanitized: { fullName, email, password, code }
  };
}

export function validateRegisterStepTwo(input: {
  fullName: unknown;
  email: unknown;
  password: unknown;
  verificationCode: unknown;
}) {
  const base = validateRegisterStepOne({
    fullName: input.fullName,
    email: input.email,
    password: input.password,
  });

  if (!base.ok) return base;

  const verificationCode = normalizeString(input.verificationCode).toUpperCase();
  if (!verificationCode) return { ok: false as const, error: 'ALTUS Register Error: Verification code cannot be empty' };
  if (!VERIFICATION_CODE_REGEX.test(verificationCode)) return { ok: false as const, error: 'ALTUS Register Error: Verification code must be 6 characters' };

  return {
    ok: true as const,
    sanitized: {
      ...base.sanitized,
      verificationCode,
    }
  };
}

export function validateShipmentInput(input: Record<string, unknown>) {
  const tracking_number = normalizeString(input.tracking_number);
  const sender = normalizeString(input.sender);
  const sender_contact = normalizeString(input.sender_contact);
  const sender_address = normalizeString(input.sender_address);
  const recipient_name = normalizeString(input.recipient_name);
  const recipient_contact = normalizeString(input.recipient_contact);
  const recipient_address = normalizeString(input.recipient_address);
  const origin = normalizeString(input.origin);
  const destination = normalizeString(input.destination);
  const item_type = normalizeString(input.item_type);
  const service_type = normalizeString(input.service_type) as ShipmentServiceType;
  const status = normalizeString(input.status) as ShipmentStatus;
  const notes = normalizeOptionalString(input.notes);
  const rawWeight = typeof input.weight === 'number' ? input.weight : Number(input.weight);
  const weight = Number.isFinite(rawWeight) ? rawWeight : NaN;

  let flight_id: number | null = null;
  if (input.flight_id !== null && input.flight_id !== undefined && `${input.flight_id}`.trim() !== '') {
    const parsedFlightId = typeof input.flight_id === 'number' ? input.flight_id : Number(input.flight_id);
    if (!Number.isInteger(parsedFlightId) || parsedFlightId <= 0) {
      return { ok: false as const, error: 'Shipment Error: Flight selection is invalid' };
    }
    flight_id = parsedFlightId;
  }

  if (!tracking_number) return { ok: false as const, error: 'Shipment Error: Tracking number cannot be empty' };
  if (!sender) return { ok: false as const, error: 'Shipment Error: Sender name cannot be empty' };
  if (sender.length < 3) return { ok: false as const, error: 'Shipment Error: Sender name must be at least 3 characters' };
  if (!sender_contact) return { ok: false as const, error: 'Shipment Error: Sender contact cannot be empty' };
  if (!isValidPhone(sender_contact)) return { ok: false as const, error: 'Shipment Error: Sender phone number must be 10–13 digits (e.g., 081234567890 or +6281234567890)' };
  if (!sender_address) return { ok: false as const, error: 'Shipment Error: Sender address cannot be empty' };
  if (!recipient_name) return { ok: false as const, error: 'Shipment Error: Recipient name cannot be empty' };
  if (recipient_name.length < 3) return { ok: false as const, error: 'Shipment Error: Recipient name must be at least 3 characters' };
  if (!recipient_contact) return { ok: false as const, error: 'Shipment Error: Recipient contact cannot be empty' };
  if (!isValidPhone(recipient_contact)) return { ok: false as const, error: 'Shipment Error: Recipient phone number must be 10–13 digits (e.g., 081234567890 or +6281234567890)' };
  if (!recipient_address) return { ok: false as const, error: 'Shipment Error: Recipient address cannot be empty' };
  if (!origin) return { ok: false as const, error: 'Shipment Error: Origin city cannot be empty' };
  if (!destination) return { ok: false as const, error: 'Shipment Error: Destination city cannot be empty' };
  if (!item_type) return { ok: false as const, error: 'Shipment Error: Item type cannot be empty' };
  if (!service_type) return { ok: false as const, error: 'Shipment Error: Service type cannot be empty' };
  if (!SHIPMENT_SERVICE_TYPES.includes(service_type)) return { ok: false as const, error: 'Shipment Error: Service type is invalid' };
  if (!status) return { ok: false as const, error: 'Shipment Error: Status cannot be empty' };
  if (!SHIPMENT_STATUSES.includes(status)) return { ok: false as const, error: 'Shipment Error: Status is invalid' };
  if (!Number.isFinite(weight)) return { ok: false as const, error: 'Shipment Error: Weight must be a valid number' };
  if (weight <= 0) return { ok: false as const, error: 'Shipment Error: Weight must be greater than 0' };

  return {
    ok: true as const,
    sanitized: {
      tracking_number,
      sender,
      sender_contact,
      sender_address,
      recipient_name,
      recipient_contact,
      recipient_address,
      origin,
      destination,
      weight,
      item_type,
      service_type,
      flight_id,
      status,
      notes,
    }
  };
}
