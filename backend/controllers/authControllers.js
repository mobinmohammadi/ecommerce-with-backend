
const adminModel = require("../models/adminModel");
const SellerCustomerModel = require("../models/chat/SellerCustomerModel");
const sellerModel = require("../models/sellerModel");
const { responseReturn } = require("../utils/response");
const bcrypt = require("bcrypt")
const { createToken } = require("../utils/tokenCreate");
class authControllers {
    admin_login = async (req, res) => {
        const { email, password } = req.body

        try {
            const admin = await adminModel.findOne({ email }).select('+password')

            if (admin) {
                const match = await bcrypt.compare(password, admin.password)
                if (match) {
                    const token = await createToken({
                        id: admin.id,
                        role: admin.role
                    })
                    res.cookie("accessToken", token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    })
                    responseReturn(res, 200, { token, message: "login is successfuly" })

                } else {
                    responseReturn(res, 401, { message: "Password Is Wrong" })

                }

            } else {
                responseReturn(res, 404, { error: "User Is Not Found" })

            }

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }


    seller_register = async (req, res) => {
        const { email, name, password } = req.body
        try {
            const getUser = await sellerModel.findOne({ email })
            if (getUser) {
                responseReturn(res, 404, { error: 'Email Already Exist' })
            } else {
                const seller = await sellerModel.create({
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    image: "",
                    method: "manualy",
                    shopInfo: {}
                })
                console.log(seller);
                await SellerCustomerModel.create({
                    myId: seller.id
                })
                const token = await createToken({ id: seller.id, role: seller.role })
                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                })
                responseReturn(res, 201, { token, message: "Register SuccessFully" })

            }
        } catch (error) {
            responseReturn(res, 500, { erorr: "Internal Server Error 😣 " })

        }

    }

    seller_login = async (req, res) => {
        console.log(req.body);
        const { email, password } = req.body
        try {
            const seller = await sellerModel.findOne({ email }).select('+password')
            if (seller) {
                const match = await bcrypt.compare(password, seller.password)
                if (match) {
                    const token = await createToken({
                        id: seller.id,
                        role: seller.role
                    })
                    res.cookie("accessToken", token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    })
                    responseReturn(res, 200, { token, message: "login is successfuly" })

                } else {
                    responseReturn(res, 401, { message: "Password Is Wrong" })

                }

            } else {
                responseReturn(res, 404, { message: "User Is Not Found" })

            }

        } catch (error) {
            console.error("seller_login error:", error)
            return responseReturn(res, 500, { error: "Internal server error" })

        }


    }


    getUser = async (req, res) => {
        const { id, role } = req
        try {
            if (role === "admin") {
                const admin = await adminModel.findById(id)
                responseReturn(res, 20, { userInfo: admin })
            }
            if (role === "user") {
                const seller = await sellerModel.findById(id)
                responseReturn(res, 20, { userInfo: seller })
            }


        }

        catch (error) {
            responseReturn(res, 500, { erorr: "Internal Server Error 😣 " })

        }
    }
}

module.exports = new authControllers()