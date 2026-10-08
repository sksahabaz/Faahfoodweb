package com.food.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Menu {

	private int menuId;
	private int restaurantId;
	private String itemName;
	private String description;
	private BigDecimal price;
	private String category;
	private String imageUrl;
	private boolean isAvailable;
	private Timestamp createdDate;

	// Default constructor
	public Menu() {
	}

	// Parameterized constructor
	public Menu(int menuId, int restaurantId, String itemName, String description, BigDecimal price, String category,
			String imageUrl, boolean isAvailable, Timestamp createdDate) {

		this.menuId = menuId;
		this.restaurantId = restaurantId;
		this.itemName = itemName;
		this.description = description;
		this.price = price;
		this.category = category;
		this.imageUrl = imageUrl;
		this.isAvailable = isAvailable;
		this.createdDate = createdDate;
	}

	// Getters and Setters

	public int getMenuId() {
		return menuId;
	}

	public void setMenuId(int menuId) {
		this.menuId = menuId;
	}

	public int getRestaurantId() {
		return restaurantId;
	}

	public void setRestaurantId(int restaurantId) {
		this.restaurantId = restaurantId;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public boolean isAvailable() {
		return isAvailable;
	}

	public void setAvailable(boolean available) {
		isAvailable = available;
	}

	public Timestamp getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Timestamp createdDate) {
		this.createdDate = createdDate;
	}

	@Override
	public String toString() {
		return "Menu{" + "menuId=" + menuId + ", restaurantId=" + restaurantId + ", itemName='" + itemName + '\''
				+ ", description='" + description + '\'' + ", price=" + price + ", category='" + category + '\''
				+ ", imageUrl='" + imageUrl + '\'' + ", isAvailable=" + isAvailable + ", createdDate=" + createdDate
				+ '}';
	}
}