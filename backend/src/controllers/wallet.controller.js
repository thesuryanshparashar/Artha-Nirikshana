import { asyncHandler } from "../utils/asyncHandler.js"
import { Wallet } from "../models/wallet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import { check, validationResult } from "express-validator"

const userWallet = asyncHandler(async (req, res) => {
    const wallet = await Wallet.findOne({ owner: req.user._id })

    if (!wallet) {
        throw new ApiError(404, "Wallet not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { walletName: wallet.walletName, balance: wallet.balance },
                "Wallet retrieved successfully"
            )
        )
})

const createWallet = asyncHandler(async (req, res) => {
    const existingWallet = await Wallet.findOne({ owner: req.user._id })

    if (existingWallet) {
        throw new ApiError(400, "Wallet already exists")
    }

    const wallet = await Wallet.create({ owner: req.user._id, })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    walletName: wallet.walletName,
                    balance: wallet.balance
                },
                "Wallet created successfully"
            )
        )
})

const addWalletBalance = [
    check("amount").isNumeric().withMessage("Amount must be a number"),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new ApiError(
                400,
                errors.array().map((error) => error.msg)
            )
        }

        const { amount } = req.body

        if (amount < 0) {
            throw new ApiError(400, "Amount cannot be negative")
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const wallet = await Wallet.findOne({
                owner: req.user._id,
            }).session(session)

            if (!wallet) {
                throw new ApiError(404, "Wallet not found")
            }

            wallet.balance += amount

            await wallet.save({ session })

            await session.commitTransaction()
            session.endSession()

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { balance: wallet.balance },
                        "Balance added successfully"
                    )
                )
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            throw new ApiError(500, "Balance addition failed")
        }
    }),
]

const changeWalletName = asyncHandler(async (req, res) => {
    const { walletName } = req.body

    const wallet = await Wallet.findOne({ owner: req.user._id })

    if (!wallet) {
        throw new ApiError(404, "Wallet not found")
    }

    wallet.walletName = walletName
    await wallet.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { walletName: wallet.walletName },
                "Wallet name changed successfully"
            )
        )
})

const deleteWallet = asyncHandler(async (req, res) => {
    const wallet = await Wallet.findOneAndUpdate(
        { owner: req.user._id },
        { walletName: "Wallet", balance: 0 },
        { new: true }
    )

    if (!wallet) {
        throw new ApiError(404, "Wallet not found/deleted")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Wallet deleted successfully"))
})

export { userWallet, createWallet, addWalletBalance, changeWalletName, deleteWallet }
