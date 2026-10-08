package com.food.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Restaurant {

    private int restaurantId;
    private String name;
    private String description;
    private String address;
    private String phone;
    private BigDecimal rating;
    private int deliveryTime;
    private Timestamp createdDate;
    private String imageUrl;

    // Default constructor
    public Restaurant() {
    }

    // Parameterized constructor
    public Restaurant(int restaurantId, String name, String description,
                      String address, String phone, BigDecimal rating,
                      int deliveryTime, Timestamp createdDate,
                      String imageUrl) {

        this.restaurantId = restaurantId;
        this.name = name;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.rating = rating;
        this.deliveryTime = deliveryTime;
        this.createdDate = createdDate;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters

    public int getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(int restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public int getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(int deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public Timestamp getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Timestamp createdDate) {
        this.createdDate = createdDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "Restaurant{" +
                "restaurantId=" + restaurantId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", address='" + address + '\'' +
                ", phone='" + phone + '\'' +
                ", rating=" + rating +
                ", deliveryTime=" + deliveryTime +
                ", createdDate=" + createdDate +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}