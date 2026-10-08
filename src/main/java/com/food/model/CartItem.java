package com.food.model;

import java.math.BigDecimal;

public class CartItem {

	private Menu menu;
	private int quantity;

	// Constructor
	public CartItem(Menu menu, int quantity) {
		this.menu = menu;
		this.quantity = quantity;
	}

	// Getter
	public Menu getMenu() {
		return menu;
	}

	// Setter
	public void setMenu(Menu menu) {
		this.menu = menu;
	}

	// Getter
	public int getQuantity() {
		return quantity;
	}

	// Setter
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	// Calculate subtotal
	public BigDecimal getSubtotal() {
		return menu.getPrice().multiply(BigDecimal.valueOf(quantity));
	}
}