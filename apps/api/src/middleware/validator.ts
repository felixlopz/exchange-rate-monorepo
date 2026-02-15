import { Request, Response, NextFunction } from "express";

const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { startDate, endDate } = req.query;

  if (startDate && !isValidDate(startDate as string)) {
    res.status(400).json({
      success: false,
      error: "Invalid startDate format. Use YYYY-MM-DD",
    });
    return;
  }

  if (endDate && !isValidDate(endDate as string)) {
    res.status(400).json({
      success: false,
      error: "Invalid endDate format. Use YYYY-MM-DD",
    });
    return;
  }

  if (
    startDate &&
    endDate &&
    new Date(startDate as string) > new Date(endDate as string)
  ) {
    res.status(400).json({
      success: false,
      error: "startDate must be before endDate",
    });
    return;
  }

  next();
};
