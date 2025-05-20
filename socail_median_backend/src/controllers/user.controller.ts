import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name } = req.body;
  const user = await User.create({ name });
  res.status(201).json(user);
};
