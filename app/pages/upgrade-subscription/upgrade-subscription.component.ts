import { Component, OnInit, AfterContentInit, OnDestroy } from "@angular/core";
//import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";

import { alert, action } from "ui/dialogs";
import { TabView, SelectedIndexChangedEventData, TabViewItem } from "ui/tab-view";

import { isAndroid, isIOS } from "platform";
import * as app from "application";
declare var android: any; //bypass the TS warnings
declare var UIView: any; //bypass the TS warnings

import { RouterExtensions } from "nativescript-angular/router";
//import { registerElement } from "nativescript-angular/element-registry";
//registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);
import { LoadingIndicator } from "nativescript-loading-indicator";

//import { TNSFontIconService } from 'nativescript-ngx-fonticon';

import * as purchase from "nativescript-purchase";
import { Transaction, TransactionState } from "nativescript-purchase/transaction";
import { Product } from "nativescript-purchase/product";

import { TNSFancyAlert } from "nativescript-fancyalert";

import { ErrorNotifierService } from "../../core/error-notifier";
import { SnackbarMessageService } from "../../core/snackbar-message.service";
//import { ValidationService } from "../../core/services/validation.service";
import { UpgradeSubscriptionService } from "./shared/upgrade-subscription.service";

import { SubscriptionModel, TransactionModel } from "./shared/upgrade-subscription.model";
import { AuthStore } from "../../core/storage/auth-storage";


import { isJson } from "../../core/check-json";

@Component({
    selector: "tracker-upgrade-subscription",
    moduleId: module.id,
    templateUrl: "./upgrade-subscription.component.html"
})

export class UpgradeSubscriptionComponent implements OnInit, AfterContentInit, OnDestroy {

    //loader: LoadingIndicator;
    groupId: string;

    tabSelectedIndex: number = 1;

    isLoading = false;
    isLoad = true;
    renderViewTimeout: any;

    tabs: SubscriptionModel[] = [];
    subscriptionName: string[] = [];
    //subscriptions: Array<Product>;
    isMonthySubscription: boolean = true;

    transactionModel: TransactionModel;
    transactionProduct: SubscriptionModel;


    constructor(private snackbarService: SnackbarMessageService,
        private errorNotifier: ErrorNotifierService, private route: ActivatedRoute,
        private routerExtensions: RouterExtensions, private authStore: AuthStore,
        private subscriptionService: UpgradeSubscriptionService) {

        this.route.params.subscribe((params) => {
            this.groupId = params["groupId"];
            // alert("paramUserName"  +this.paramUserName);
        });

        this.errorHandler();



        purchase.on(purchase.transactionUpdatedEvent, (transaction: Transaction) => {
            if (transaction.transactionState === TransactionState.Purchased) {
                //alert(`Congratulations you just bought ${transaction.productIdentifier}!`);
                console.log("Purchased : " + JSON.stringify(transaction));
                // console.log(transaction.transactionDate);
                // console.log(transaction.transactionIdentifier);
                // if(transaction.productIdentifier.indexOf(".consume") >= 0){

                this.onPurchaseComplete(transaction);

                // }

                //applicationSettings.setBoolean(transaction.productIdentifier, true);
            }
            else if (transaction.transactionState === TransactionState.Restored) {
                //console.log(`Purchase of ${transaction.productIdentifier} restored.`);
                console.log(`Purchase restored.`);
                console.log(JSON.stringify(transaction));
                // console.log(transaction.transactionIdentifier);
                // console.log(transaction.originalTransaction.transactionDate);
                //applicationSettings.setBoolean(transaction.productIdentifier, true);

                purchase.consumePurchase(transaction.originalTransaction.transactionReceipt)
                    .then((responseCode) => {
                        console.log("Response Code :" + responseCode);

                        //alert(`Congratulations you just bought!`);
                    })
                    .catch((e) => console.log(e));
            }
            else if (transaction.transactionState === TransactionState.Failed) {
                //alert(`Purchase of ${transaction.productIdentifier} failed!`);
                alert(`Purchase failed!`);
            }
        });
    }

    ngAfterContentInit() {
        this.renderViewTimeout = setTimeout(() => {
            this.isLoad = false;
        }, 300);
    }

    ngOnDestroy() {
        clearTimeout(this.renderViewTimeout);
    }

    errorHandler() {
        this.errorNotifier.onError(err => {
            console.log("Handle Error " + JSON.stringify(err));
            this.isLoading = false;
            if (err.status === 401) {
                this.snackbarService.info("Not Authorized");
                this.routerExtensions.navigate(["login"], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            }
            else if (err.status === 101) {
                alert({
                    title: "Notice",
                    message: err.message,
                    okButtonText: "Okay"
                }).then(function () {
                    console.log("Dialog closed!");
                });
            }
            else if (err.status === 102) {
                this.snackbarService.info(err.message);
            }
            else {
                if (err.error == "invalid_grant") {
                    this.routerExtensions.navigate(["login"], {
                        transition: {
                            name: "slideLeft"
                        },
                        clearHistory: true
                    });
                } else {
                    this.snackbarService.info("No internet connection found!");
                }
            }
        });
    }

    // loading the view
    public isLoadingView(flag: boolean) {
        this.isLoading = flag;
    }

    ngOnInit() {
        if (isAndroid) {
            // prevent the soft keyboard from showing initially when textfields are present
            app.android.startActivity.getWindow().setSoftInputMode(
                android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
        }

        this.getAllSubscription();
    }

    errorMsg(error) {
        // Show error                
        if (isJson(error)) {
            if (error.Message == "UserProfile_NOT_COMPLETE") {
                this.routerExtensions.navigate(["user-profile"], {
                    transition: {
                        name: "slideLeft"
                    },
                    clearHistory: true
                });
            } else {
                TNSFancyAlert.showError("Error!", error.Error.join(), "Dismiss");
            }
        }
        else {
            TNSFancyAlert.showError("Error!", error, "Dismiss");
        }
    }

    public onGoBack() {
        this.routerExtensions.backToPreviousPage()
        // this.authStore.remove();
        // this.routerExtensions.navigate(["login"], {
        //     transition: {
        //         name: "slideLeft"
        //     },
        //     clearHistory: true
        // });
    }

    onPurchaseComplete(transaction) {
        let loader = new LoadingIndicator();

        // optional options
        // android and ios have some platform specific options
        var options = {
            message: 'Please wait...',
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: false,
                cancelListener: function (dialog) { console.log("Loading cancelled") },
                max: 100,
                progressNumberFormat: "%1d/%2d",
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1
            },
            ios: {
                details: "Additional detail note!",
                margin: 10,
                dimBackground: true,
                color: "#4B9ED6", // color of indicator and labels
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: "yellow",
                userInteractionEnabled: false, // default true. Set false so that the touches will fall through it.
                hideBezel: true // default false, can hide the surrounding bezel
                //view: UIView, // Target view to show on top of (Defaults to entire window)
                //mode: // see iOS specific options below
            }
        };
        // Show Loading
        loader.show(options); // options is optional
        purchase.consumePurchase(transaction.transactionReceipt)
            .then((responseCode) => {
                console.log(responseCode);
                // // Show Loading
                // this.isLoadingView(true);

                this.transactionModel = new TransactionModel();
                this.transactionModel.IsPackageMonthly = this.isMonthySubscription;
                if (this.isMonthySubscription) {
                    this.transactionProduct = this.tabs.find(p => p.PlayStoreIdForMonth == transaction.productIdentifier);
                    this.transactionModel.SubscriptionId = this.transactionProduct.SubscriptionId;
                    this.transactionModel.PaidAmount = this.transactionProduct.PricePerMonth;
                } else {
                    this.transactionProduct = this.tabs.find(p => p.PlayStoreIdForYear == transaction.productIdentifier);
                    this.transactionModel.SubscriptionId = this.transactionProduct.SubscriptionId;
                    this.transactionModel.PaidAmount = this.transactionProduct.PricePerYear;
                }

                this.transactionModel.TransactionNumber = transaction.transactionReceipt;
                this.transactionModel.TransactionDate = new Date();

                console.log("Transaction Mode : " + JSON.stringify(this.transactionModel));


                this.subscriptionService.addTransaction(this.transactionModel).subscribe((response) => {
                    // Hide Loading
                    //this.isLoadingView(false);
                    loader.hide();
                    this.routerExtensions.navigate(["update-group", response.GroupId], {
                        transition: {
                            name: "slideLeft"
                        }
                    });
                }, (error) => {
                    // Hide Loading
                    //this.isLoadingView(false);
                    loader.hide();

                    this.errorMsg(error);
                });

                //alert(`Congratulations you just bought!`);
            })
            .catch((e) => {
                // Hide Loading
                //this.isLoadingView(false);
                loader.hide();
                console.log(e);
            });
    }

    getAllSubscription() {
        // Show Loading
        this.isLoadingView(true);
        this.subscriptionService.getAll().subscribe((response) => {
            // Get All Subscriptions
            this.tabs = response;

            this.tabs.forEach(element => {
                if (element.SubscriptionType != 0) {
                    this.subscriptionName.push(element.PlayStoreIdForMonth);
                    this.subscriptionName.push(element.PlayStoreIdForYear);
                }
            });

            purchase.init(this.subscriptionName);

            // purchase.getProducts()
            //     .then((res) => {
            //         this.subscriptions = res;
            //     }).catch((e) => alert(e));   


            // Hide Loading
            this.isLoadingView(false);

        }, (error) => {
            // Hide Loading
            this.isLoadingView(false);

            this.errorMsg(error);
        });
    }

    public onIndexChanged(args) {
        let tabView = <TabView>args.object;
        this.tabSelectedIndex = tabView.selectedIndex;
        console.log("Selected index changed! New inxed: " + tabView.selectedIndex);
    }

    onSubscribeTab() {
        let products = this.tabs[this.tabSelectedIndex];
        console.log("Database Products : " + JSON.stringify(products));

        if (products.SubscriptionType == 0) {
            this.transactionModel = new TransactionModel();
            this.transactionModel.UserGroupId = this.groupId;
            this.transactionModel.IsPackageMonthly = this.isMonthySubscription;
            this.transactionModel.SubscriptionId = products.SubscriptionId;
            this.transactionModel.PaidAmount = products.PricePerMonth;
            this.transactionModel.TransactionNumber = "Free";
            this.transactionModel.TransactionDate = new Date();


            this.subscriptionService.addTransaction(this.transactionModel).subscribe((response) => {
                // Hide Loading
                this.isLoadingView(false);
                // this.routerExtensions.navigate(["update-group", response.GroupId], {
                //     transition: {
                //         name: "slideLeft"
                //     }
                // });

                this.routerExtensions.navigate(["group", response.GroupId], {
                    transition: {
                        name: "slideLeft"
                    }
                });

            }, (error) => {
                // Hide Loading
                this.isLoadingView(false);

                this.errorMsg(error);
            });
        }
        else {
            action({
                message: "Select Plan",
                cancelButtonText: "Cancel",
                actions: ["Monthly", "Yearly"]
            }).then(result => {
                console.log("Dialog result: " + result);

                console.log("Tab Index: " + result);

                if (result == "Cancel") {
                }
                else {
                    if (result == "Monthly") {
                        this.isMonthySubscription = true;
                        this.isLoadingView(true);
                        purchase.restorePurchases();
                        //Do action1
                        if (purchase.canMakePayments()) {
                            this.isLoadingView(false);
                            this.isLoadingView(true);
                            purchase.getProducts()
                                .then((res) => {
                                    this.isLoadingView(false);
                                    console.log("Products : " + JSON.stringify(res));
                                    //this.subscriptions = res;

                                    let product = res.find(p => p.productIdentifier == products.PlayStoreIdForMonth)

                                    //let product = this.subscriptions.find(p => p.productIdentifier == products.PlayStoreIdForMonth) as Product;
                                    if (product != null) {
                                        // NOTE: 'product' must be the same instance as the one returned from getProducts()
                                        purchase.buyProduct(product);
                                    } else {
                                        alert("Sorry, No subscription found!");
                                    }

                                }).catch((e) => {
                                    this.isLoadingView(false);
                                    alert(e)
                                });


                        }
                        else {
                            alert("Sorry, your account is not eligible to make payments!");
                        }
                    } else if (result == "Yearly") {
                        this.isMonthySubscription = false;
                        this.isLoadingView(true);
                        purchase.restorePurchases();
                        //Do action2
                        if (purchase.canMakePayments()) {
                            this.isLoadingView(false);
                            //let products = this.tabs[this.tabSelectedIndex];
                            this.isLoadingView(true);
                            purchase.getProducts()
                                .then((res) => {
                                    this.isLoadingView(false);
                                    console.log("Products : " + JSON.stringify(res));
                                    //this.subscriptions = res;
                                    let product = res.find(p => p.productIdentifier == products.PlayStoreIdForYear)
                                    //let product = this.subscriptions.find(p => p.productIdentifier == products.PlayStoreIdForMonth) as Product;
                                    if (product != null) {
                                        // NOTE: 'product' must be the same instance as the one returned from getProducts()
                                        purchase.buyProduct(product);
                                    } else {
                                        alert("Sorry, No subscription found!");
                                    }
                                }).catch((e) => {
                                    this.isLoadingView(false);
                                    alert(e)
                                });


                        }
                        else {
                            alert("Sorry, your account is not eligible to make payments!");
                        }
                    }
                }
            });
        }
    }

    group() {
        this.routerExtensions.navigate([""], {
            transition: {
                name: "slideLeft"
            }
        });
    }

    updateProfile() {
        this.routerExtensions.navigate(["user-profile"], {
            transition: {
                name: "slideLeft"
            }
        });
    }

}