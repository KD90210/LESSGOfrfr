import qrcode

website_link = ""

qr = qrcode.QRCode(
    version=1,box_size=5,border=5)
qr.add_data(website_link)
qr.make()